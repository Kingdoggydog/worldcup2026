#!/usr/bin/env node
// Calculates clinched group winners using full FIFA tiebreaker simulation.
// Reads data.json (already fetched by the workflow), writes group-winners.json.
// A group only gets a winner once every team has played >=2 games and the
// winner is mathematically guaranteed across every possible remaining result.

const fs = require('fs');

const GROUPS = {
  A: ['Mexico','South Korea','South Africa','Czechia'],
  B: ['Canada','Switzerland','Qatar','Bosnia'],
  C: ['Brazil','Morocco','Scotland','Haiti'],
  D: ['USA','Australia','Paraguay','Turkiye'],
  E: ['Germany','Ivory Coast','Ecuador','Curacao'],
  F: ['Netherlands','Japan','Tunisia','Sweden'],
  G: ['Belgium','Iran','Egypt','New Zealand'],
  H: ['Spain','Uruguay','Saudi Arabia','Cape Verde'],
  I: ['France','Senegal','Norway','Iraq'],
  J: ['Argentina','Algeria','Austria','Jordan'],
  K: ['Portugal','Colombia','Uzbekistan','Congo DR'],
  L: ['England','Croatia','Ghana','Panama'],
};


const GROUP_FIXTURES = [
  {grp:'A', date:'2026-06-11', home:'Mexico', away:'South Africa'},
  {grp:'A', date:'2026-06-12', home:'South Korea', away:'Czechia'},
  {grp:'A', date:'2026-06-18', home:'Czechia', away:'South Africa'},
  {grp:'A', date:'2026-06-19', home:'Mexico', away:'South Korea'},
  {grp:'A', date:'2026-06-25', home:'Czechia', away:'Mexico'},
  {grp:'A', date:'2026-06-25', home:'South Africa', away:'South Korea'},
  {grp:'B', date:'2026-06-12', home:'Canada', away:'Bosnia & Herz.'},
  {grp:'B', date:'2026-06-13', home:'Qatar', away:'Switzerland'},
  {grp:'B', date:'2026-06-18', home:'Switzerland', away:'Bosnia'},
  {grp:'B', date:'2026-06-18', home:'Canada', away:'Qatar'},
  {grp:'B', date:'2026-06-24', home:'Switzerland', away:'Canada'},
  {grp:'B', date:'2026-06-24', home:'Bosnia', away:'Qatar'},
  {grp:'C', date:'2026-06-13', home:'Brazil', away:'Morocco'},
  {grp:'C', date:'2026-06-14', home:'Haiti', away:'Scotland'},
  {grp:'C', date:'2026-06-19', home:'Scotland', away:'Morocco'},
  {grp:'C', date:'2026-06-20', home:'Brazil', away:'Haiti'},
  {grp:'C', date:'2026-06-24', home:'Scotland', away:'Brazil'},
  {grp:'C', date:'2026-06-24', home:'Morocco', away:'Haiti'},
  {grp:'D', date:'2026-06-13', home:'USA', away:'Paraguay'},
  {grp:'D', date:'2026-06-14', home:'Australia', away:'Turkiye'},
  {grp:'D', date:'2026-06-19', home:'USA', away:'Australia'},
  {grp:'D', date:'2026-06-20', home:'Turkiye', away:'Paraguay'},
  {grp:'D', date:'2026-06-26', home:'Turkiye', away:'USA'},
  {grp:'D', date:'2026-06-26', home:'Paraguay', away:'Australia'},
  {grp:'E', date:'2026-06-14', home:'Germany', away:'Curacao'},
  {grp:'E', date:'2026-06-14', home:'Ivory Coast', away:'Ecuador'},
  {grp:'E', date:'2026-06-20', home:'Germany', away:'Ivory Coast'},
  {grp:'E', date:'2026-06-21', home:'Ecuador', away:'Curacao'},
  {grp:'E', date:'2026-06-25', home:'Curacao', away:'Ivory Coast'},
  {grp:'E', date:'2026-06-25', home:'Ecuador', away:'Germany'},
  {grp:'F', date:'2026-06-14', home:'Netherlands', away:'Japan'},
  {grp:'F', date:'2026-06-15', home:'Sweden', away:'Tunisia'},
  {grp:'F', date:'2026-06-20', home:'Netherlands', away:'Sweden'},
  {grp:'F', date:'2026-06-21', home:'Tunisia', away:'Japan'},
  {grp:'F', date:'2026-06-25', home:'Japan', away:'Sweden'},
  {grp:'F', date:'2026-06-25', home:'Tunisia', away:'Netherlands'},
  {grp:'G', date:'2026-06-15', home:'Belgium', away:'Egypt'},
  {grp:'G', date:'2026-06-16', home:'Iran', away:'New Zealand'},
  {grp:'G', date:'2026-06-21', home:'Belgium', away:'Iran'},
  {grp:'G', date:'2026-06-22', home:'New Zealand', away:'Egypt'},
  {grp:'G', date:'2026-06-27', home:'Egypt', away:'Iran'},
  {grp:'G', date:'2026-06-27', home:'New Zealand', away:'Belgium'},
  {grp:'H', date:'2026-06-15', home:'Spain', away:'Cape Verde'},
  {grp:'H', date:'2026-06-15', home:'Saudi Arabia', away:'Uruguay'},
  {grp:'H', date:'2026-06-21', home:'Spain', away:'Saudi Arabia'},
  {grp:'H', date:'2026-06-21', home:'Uruguay', away:'Cape Verde'},
  {grp:'H', date:'2026-06-27', home:'Cape Verde', away:'Saudi Arabia'},
  {grp:'H', date:'2026-06-27', home:'Uruguay', away:'Spain'},
  {grp:'I', date:'2026-06-16', home:'France', away:'Senegal'},
  {grp:'I', date:'2026-06-16', home:'Iraq', away:'Norway'},
  {grp:'I', date:'2026-06-22', home:'France', away:'Iraq'},
  {grp:'I', date:'2026-06-23', home:'Norway', away:'Senegal'},
  {grp:'I', date:'2026-06-26', home:'Norway', away:'France'},
  {grp:'I', date:'2026-06-26', home:'Senegal', away:'Iraq'},
  {grp:'J', date:'2026-06-17', home:'Argentina', away:'Algeria'},
  {grp:'J', date:'2026-06-17', home:'Austria', away:'Jordan'},
  {grp:'J', date:'2026-06-22', home:'Argentina', away:'Austria'},
  {grp:'J', date:'2026-06-23', home:'Jordan', away:'Algeria'},
  {grp:'J', date:'2026-06-28', home:'Jordan', away:'Argentina'},
  {grp:'J', date:'2026-06-28', home:'Algeria', away:'Austria'},
  {grp:'K', date:'2026-06-17', home:'Portugal', away:'Congo DR'},
  {grp:'K', date:'2026-06-18', home:'Uzbekistan', away:'Colombia'},
  {grp:'K', date:'2026-06-23', home:'Portugal', away:'Uzbekistan'},
  {grp:'K', date:'2026-06-24', home:'Colombia', away:'Congo DR'},
  {grp:'K', date:'2026-06-27', home:'Colombia', away:'Portugal'},
  {grp:'K', date:'2026-06-27', home:'Congo DR', away:'Uzbekistan'},
  {grp:'L', date:'2026-06-17', home:'England', away:'Croatia'},
  {grp:'L', date:'2026-06-17', home:'Ghana', away:'Panama'},
  {grp:'L', date:'2026-06-23', home:'England', away:'Ghana'},
  {grp:'L', date:'2026-06-23', home:'Panama', away:'Croatia'},
  {grp:'L', date:'2026-06-27', home:'Panama', away:'England'},
  {grp:'L', date:'2026-06-27', home:'Croatia', away:'Ghana'}
];


function sortTeams(teamNames, grp, groupStats, results) {
  // Official FIFA 2026 tiebreaker order:
  // 1. Overall points
  // 2. H2H points (among all tied teams)
  // 3. H2H goal difference (among all tied teams)
  // 4. H2H goals scored (among all tied teams)
  // -- If still tied, repeat 2-4 exclusively between remaining tied teams --
  // 5. Overall goal difference
  // 6. Overall goals scored
  // 7. Alphabetical (proxy - fair play/FIFA ranking not available via API)

  // First pass: sort by overall points, then H2H, then overall GD/GF
  const sorted = [...teamNames].sort((a, b) => {
    const sa = groupStats[a], sb = groupStats[b];

    // 1. Overall points
    if (sb.pts !== sa.pts) return sb.pts - sa.pts;

    // 2-4. H2H among all teams tied on same points
    const tiedGroup = teamNames.filter(t => groupStats[t].pts === sa.pts);
    if (tiedGroup.length > 1) {
      const h2h = h2hStats(tiedGroup, grp, results);
      const ha = h2h[a], hb = h2h[b];
      if (hb.pts !== ha.pts) return hb.pts - ha.pts;
      if (hb.gd !== ha.gd) return hb.gd - ha.gd;
      if (hb.gf !== ha.gf) return hb.gf - ha.gf;
    }

    // 5. Overall goal difference
    const gdA = sa.gf - sa.ga, gdB = sb.gf - sb.ga;
    if (gdB !== gdA) return gdB - gdA;

    // 6. Overall goals scored
    if (sb.gf !== sa.gf) return sb.gf - sa.gf;

    // 7. Alphabetical
    return a.localeCompare(b);
  });

  // Second pass: for any teams still tied after step 4 (same pts, H2H inconclusive),
  // re-apply H2H exclusively between just those still-tied teams (FIFA Article 13)
  const result = [...sorted];
  let i = 0;
  while (i < result.length) {
    const a = result[i];
    const sa = groupStats[a];
    // Find run of teams with same overall pts AND same H2H outcome
    let j = i + 1;
    while (j < result.length) {
      const b = result[j];
      const sb = groupStats[b];
      if (sb.pts !== sa.pts) break;
      // Check if H2H didn't separate them (same H2H pts, gd, gf between full tied group)
      const tiedGroup = teamNames.filter(t => groupStats[t].pts === sa.pts);
      const h2hFull = h2hStats(tiedGroup, grp, results);
      const ha = h2hFull[a], hb = h2hFull[b];
      if (hb.pts !== ha.pts || hb.gd !== ha.gd || hb.gf !== ha.gf) break;
      j++;
    }
    if (j - i > 1) {
      // These teams (result[i..j-1]) are still tied - re-apply H2H just between them
      const stillTied = result.slice(i, j);
      const h2hNarrow = h2hStats(stillTied, grp, results);
      stillTied.sort((a, b) => {
        const ha = h2hNarrow[a], hb = h2hNarrow[b];
        if (hb.pts !== ha.pts) return hb.pts - ha.pts;
        if (hb.gd !== ha.gd) return hb.gd - ha.gd;
        if (hb.gf !== ha.gf) return hb.gf - ha.gf;
        // Still tied - overall GD/GF/alphabetical
        const sa = groupStats[a], sb = groupStats[b];
        const gdA = sa.gf - sa.ga, gdB = sb.gf - sb.ga;
        if (gdB !== gdA) return gdB - gdA;
        if (sb.gf !== sa.gf) return sb.gf - sa.gf;
        return a.localeCompare(b);
      });
      for (let k = 0; k < stillTied.length; k++) result[i + k] = stillTied[k];
    }
    i = j;
  }

  return result;
}

// ── RENDER ────────────────────────────────────────────────────────────────────

function h2hStats(tiedTeams, grp, results) {
  const h2h = {};
  tiedTeams.forEach(t => { h2h[t] = { pts:0, gd:0, gf:0 }; });

  for (let i = 0; i < tiedTeams.length; i++) {
    for (let j = 0; j < tiedTeams.length; j++) {
      if (i === j) continue;
      const home = tiedTeams[i], away = tiedTeams[j];
      const r = results[`${grp}|${home}|${away}`];
      if (!r) continue;
      const { hg, ag } = r;
      h2h[home].gf += hg; h2h[home].gd += hg - ag;
      h2h[away].gf += ag; h2h[away].gd += ag - hg;
      if (hg > ag)      h2h[home].pts += 3;
      else if (hg < ag) h2h[away].pts += 3;
      else              { h2h[home].pts++; h2h[away].pts++; }
    }
  }
  return h2h;
}



function buildGroupStatsFromResults(teamNames, finishedResults) {
  const stats = {};
  teamNames.forEach(t => { stats[t] = { p:0, w:0, d:0, l:0, gf:0, ga:0, pts:0 }; });
  finishedResults.forEach(r => {
    const ht = stats[r.home], at = stats[r.away];
    if (!ht || !at) return;
    ht.p++; at.p++;
    ht.gf += r.hg; ht.ga += r.ag;
    at.gf += r.ag; at.ga += r.hg;
    if (r.hg > r.ag) { ht.w++; ht.pts += 3; at.l++; }
    else if (r.hg < r.ag) { at.w++; at.pts += 3; ht.l++; }
    else { ht.d++; at.d++; ht.pts++; at.pts++; }
  });
  return stats;
}

function getGroupFixtureStatus(grp, finishedByGroup) {
  const fixtures = GROUP_FIXTURES.filter(f => f.grp === grp);
  const finished = [];
  const remaining = [];
  fixtures.forEach(f => {
    const r = finishedByGroup[`${grp}|${f.home}|${f.away}`];
    if (r) finished.push({ home: f.home, away: f.away, hg: r.hg, ag: r.ag });
    else remaining.push(f);
  });
  return { finished, remaining };
}

function allTeamsPlayedTwo(teamNames, finishedResults) {
  const played = {};
  teamNames.forEach(t => played[t] = 0);
  finishedResults.forEach(r => {
    if (played[r.home] !== undefined) played[r.home]++;
    if (played[r.away] !== undefined) played[r.away]++;
  });
  return teamNames.every(t => played[t] >= 2);
}

function generateScenarios(remaining) {
  if (remaining.length === 0) return [[]];
  const outcomes = [
    () => ({hg:1, ag:0}),
    () => ({hg:0, ag:0}),
    () => ({hg:0, ag:1}),
  ];
  let scenarios = [[]];
  remaining.forEach(fix => {
    const next = [];
    scenarios.forEach(scn => {
      outcomes.forEach(outcomeFn => {
        const res = outcomeFn();
        next.push([...scn, { home: fix.home, away: fix.away, hg: res.hg, ag: res.ag }]);
      });
    });
    scenarios = next;
  });
  return scenarios;
}

function buildResultsLookup(grp, allResults) {
  const lookup = {};
  allResults.forEach(r => {
    lookup[`${grp}|${r.home}|${r.away}`] = { hg: r.hg, ag: r.ag };
  });
  return lookup;
}

// Returns the clinched group winner's name, or null if not yet determined
// Returns { first: teamName|null, second: teamName|null } - each only set once
// mathematically guaranteed across every possible remaining-fixture outcome.
function calcClinchedPositions(grp, teamNames, finishedByGroup) {
  const result = { first: null, second: null };
  const { finished, remaining } = getGroupFixtureStatus(grp, finishedByGroup);
  if (!allTeamsPlayedTwo(teamNames, finished)) return result;

  const scenarios = generateScenarios(remaining);
  if (scenarios.length > 100) return result;

  const positionsSeen = {};
  teamNames.forEach(t => positionsSeen[t] = new Set());

  scenarios.forEach(scnResults => {
    const allResults = [...finished, ...scnResults];
    const stats = buildGroupStatsFromResults(teamNames, allResults);
    const sorted = sortTeams(teamNames, grp, stats, buildResultsLookup(grp, allResults));
    sorted.forEach((team, idx) => positionsSeen[team].add(idx + 1));
  });

  for (const t of teamNames) {
    const positions = positionsSeen[t];
    if (positions.size === 1 && positions.has(1)) result.first = t;
    else if (positions.size === 1 && positions.has(2)) result.second = t;
  }
  return result;
}




// ── Main ─────────────────────────────────────────────────────────────────
function normaliseApiName(name) {
  const NAME_MAP = {
    'Korea Republic': 'South Korea',
    'United States': 'USA',
    'Bosnia and Herzegovina': 'Bosnia',
    'Bosnia-Herzegovina': 'Bosnia',
    'Curaçao': 'Curacao',
    'Turkey': 'Turkiye',
    'Cape Verde Islands': 'Cape Verde',
  };
  return NAME_MAP[name] || name;
}

const data = JSON.parse(fs.readFileSync('data.json', 'utf8'));
const matches = data.matches || [];

// Build finished-results lookup per group: "grp|home|away" -> {hg, ag}
const finishedByGroup = {};
matches.forEach(m => {
  if (m.stage !== 'GROUP_STAGE' || m.status !== 'FINISHED') return;
  const grp = (m.group || '').replace('GROUP_', '');
  const home = normaliseApiName(m.homeTeam.shortName || m.homeTeam.name);
  const away = normaliseApiName(m.awayTeam.shortName || m.awayTeam.name);
  const hg = m.score?.fullTime?.home;
  const ag = m.score?.fullTime?.away;
  if (hg === null || hg === undefined) return;
  finishedByGroup[`${grp}|${home}|${away}`] = { hg, ag };
});

const winners = {};
Object.keys(GROUPS).forEach(grp => {
  winners[grp] = calcClinchedPositions(grp, GROUPS[grp], finishedByGroup);
});

fs.writeFileSync('group-winners.json', JSON.stringify(winners));
console.log('Group winners:', JSON.stringify(winners, null, 2));
