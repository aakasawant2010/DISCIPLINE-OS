import {
  SwitchGoalConfig,
  SwitchChecklistItem,
  CompanyApplication,
  DSAProblemRecord,
  BehavioralStory,
  SwitchStudySession,
} from '../types';

export const INITIAL_SWITCH_GOAL: SwitchGoalConfig = {
  dailyTargetHours: 8.0,
  targetRole: 'Senior Software Engineer (SDE-2 / Staff)',
  targetCompanyTier: 'Tier-1 Tech & High-Growth Unicorns (FAANG, Uber, Stripe, Atlassian)',
  targetSwitchDate: '2026-11-30',
  currentCTC: '18 LPA ($110k)',
  targetCTC: '52 LPA ($240k)',
};

export const INITIAL_SWITCH_CHECKLIST: SwitchChecklistItem[] = [
  // DSA Must-Haves
  {
    id: 'chk-dsa-1',
    category: 'dsa',
    title: 'NeetCode 150 / Blind 75 Patterns',
    description: 'Master Two Pointers, Sliding Window, Monotonic Stack, and Binary Search boundary conditions without looking at solutions.',
    status: 'in_progress',
    priority: 'critical',
  },
  {
    id: 'chk-dsa-2',
    category: 'dsa',
    title: 'Graphs: BFS, DFS, Dijkstra & Topological Sort',
    description: 'Ability to detect cycles, bipartite graphs, shortest paths in weighted DAGs, and union-find disjoint sets in < 25 mins.',
    status: 'in_progress',
    priority: 'critical',
  },
  {
    id: 'chk-dsa-3',
    category: 'dsa',
    title: 'Dynamic Programming: 1D & 2D (Knapsack, LCS, LIS)',
    description: 'Identify overlapping subproblems and optimal substructure. Write bottom-up space-optimized solutions.',
    status: 'not_started',
    priority: 'high',
  },
  {
    id: 'chk-dsa-4',
    category: 'dsa',
    title: 'Trees & Tries: Serialization & Tree DP',
    description: 'Lowest Common Ancestor, Morris traversal, Trie prefix searching, and max path sums.',
    status: 'mastered',
    priority: 'high',
  },

  // System Design (HLD & LLD)
  {
    id: 'chk-sd-1',
    category: 'system-design',
    title: 'HLD: Distributed Caching & Invalidation (Redis)',
    description: 'Cache-aside vs Write-through vs Write-back, Thundering herd, Cache stampede, Eviction policies (LRU, LFU).',
    status: 'mastered',
    priority: 'critical',
  },
  {
    id: 'chk-sd-2',
    category: 'system-design',
    title: 'HLD: Message Queues & Event-Driven Architecture (Kafka)',
    description: 'Partitions, Consumer groups, At-least-once vs Exactly-once semantics, Backpressure, Dead letter queues.',
    status: 'in_progress',
    priority: 'critical',
  },
  {
    id: 'chk-sd-3',
    category: 'system-design',
    title: 'HLD: Database Sharding & Consistent Hashing',
    description: 'Horizontal vs Vertical partitioning, Shard keys, Virtual nodes, Re-sharding, Cross-shard queries.',
    status: 'in_progress',
    priority: 'critical',
  },
  {
    id: 'chk-sd-4',
    category: 'system-design',
    title: 'HLD: High-Scale Systems (Rate Limiter, URL Shortener, Uber)',
    description: 'Token bucket vs Leaky bucket, Distributed locks, Geospatial indexing (Quadtree/H3), S3 large file chunking.',
    status: 'in_progress',
    priority: 'high',
  },
  {
    id: 'chk-sd-5',
    category: 'system-design',
    title: 'LLD: SOLID & Concurrency Design Patterns',
    description: 'Thread pools, Mutex locks, Read-write locks, Race condition prevention, Strategy & Factory patterns in code.',
    status: 'mastered',
    priority: 'critical',
  },

  // Core CS Fundamentals
  {
    id: 'chk-cs-1',
    category: 'cs-fundamentals',
    title: 'OS Internals: Memory Management & Threads',
    description: 'Virtual memory paging, TLB, Context switches, Mutex vs Semaphore, Epoll / Event loop mechanics.',
    status: 'in_progress',
    priority: 'high',
  },
  {
    id: 'chk-cs-2',
    category: 'cs-fundamentals',
    title: 'Database Internals: Indexing (B+ Trees vs LSM Trees)',
    description: 'Clustered vs Non-clustered, WAL (Write-Ahead Logging), MVCC, Isolation levels (Dirty Read vs Phantom Read).',
    status: 'in_progress',
    priority: 'critical',
  },
  {
    id: 'chk-cs-3',
    category: 'cs-fundamentals',
    title: 'Computer Networks: HTTP/2, HTTP/3, WebSockets, TLS',
    description: 'TCP 3-way handshake, Head-of-line blocking, QUIC protocol, TLS 1.3 handshake latency, Keep-Alive.',
    status: 'mastered',
    priority: 'medium',
  },

  // Resume & Portfolio
  {
    id: 'chk-res-1',
    category: 'resume-portfolio',
    title: 'Single-Page ATS-Optimized Resume',
    description: 'Zero graphics or multi-columns. Bullet points structured via Google XYZ formula: "Accomplished [X], measured by [Y], by doing [Z]".',
    status: 'mastered',
    priority: 'critical',
  },
  {
    id: 'chk-res-2',
    category: 'resume-portfolio',
    title: 'Proof-of-Work: High-Throughput GitHub Project',
    description: 'Benchmarked backend or distributed tool with clean README, architecture diagram, load testing graph, and Dockerfile.',
    status: 'in_progress',
    priority: 'high',
  },
  {
    id: 'chk-res-3',
    category: 'resume-portfolio',
    title: 'LinkedIn & Wellfound Profile Overhaul',
    description: 'Keyword-optimized headline, Turn on "Open to Work" (Recruiters only), Featured architecture posts.',
    status: 'mastered',
    priority: 'high',
  },

  // Cold Reachout & Networking
  {
    id: 'chk-net-1',
    category: 'networking',
    title: 'Target Company List (Tier 1 & Tier 2 Breakdown)',
    description: 'Maintain 30 tier-ranked companies. Reach out to Engineering Managers and Senior Staff on LinkedIn with 3-sentence high-impact pitch.',
    status: 'in_progress',
    priority: 'critical',
  },
  {
    id: 'chk-net-2',
    category: 'networking',
    title: '10 High-Quality Referral Asks',
    description: 'Ask college alumni or ex-colleagues with specific Job ID and custom 50-word pitch ready to copy-paste.',
    status: 'in_progress',
    priority: 'high',
  },

  // Offer & Negotiation
  {
    id: 'chk-neg-1',
    category: 'negotiation',
    title: 'Salary & Comp Matrix Prep (Base, RSUs, Sign-on)',
    description: 'Know Level.fyi percentiles for target level. Never disclose current CTC first. Prepare competing offer leverage strategy.',
    status: 'not_started',
    priority: 'high',
  },
];

export const INITIAL_APPLICATIONS: CompanyApplication[] = [
  {
    id: 'app-1',
    company: 'Uber',
    role: 'Senior Software Engineer - Core Infrastructure',
    tier: 'Tier 1 / FAANG',
    status: 'tech_round',
    expectedComp: '58 LPA / $250k',
    notes: 'Cleared OA (100% test cases). Round 1 DSA scheduled. Heavy focus on Concurrency and Geospatial trees.',
    dateApplied: '2026-09-28',
    nextRoundDate: '2026-10-18',
  },
  {
    id: 'app-2',
    company: 'Google',
    role: 'Software Engineer III (L4/L5)',
    tier: 'Tier 1 / FAANG',
    status: 'applied',
    expectedComp: '65 LPA / $270k',
    notes: 'Referral submitted through ex-teammate. Waiting for recruiter screen call.',
    dateApplied: '2026-10-02',
  },
  {
    id: 'app-3',
    company: 'Stripe',
    role: 'Backend Infrastructure Engineer',
    tier: 'Unicorn',
    status: 'oa',
    expectedComp: '60 LPA / $260k',
    notes: 'OA link received (90 minutes, real production bug fixing + rate limiter design).',
    dateApplied: '2026-10-05',
    nextRoundDate: '2026-10-14',
  },
  {
    id: 'app-4',
    company: 'Atlassian',
    role: 'Senior Developer (P40)',
    tier: 'Tier 1 / FAANG',
    status: 'system_design',
    expectedComp: '54 LPA / $230k',
    notes: 'Cleared DSA Coding Round 1 & 2. System Design next: Distributed collaboration canvas or Jira ticket backlog.',
    dateApplied: '2026-09-15',
    nextRoundDate: '2026-10-16',
  },
];

export const INITIAL_DSA_PROBLEMS: DSAProblemRecord[] = [
  {
    id: 'dsa-1',
    name: 'Trapping Rain Water',
    platform: 'LeetCode',
    difficulty: 'Hard',
    topic: 'Two Pointers / Monotonic Stack',
    completedDate: '2026-10-09',
    timeSpentMinutes: 28,
    needsRevision: false,
    notes: 'Two pointers solution O(N) time O(1) space. LeftMax and RightMax state maintenance.',
  },
  {
    id: 'dsa-2',
    name: 'Course Schedule II',
    platform: 'LeetCode',
    difficulty: 'Medium',
    topic: 'Graphs (Topological Sort / Kahn Algorithm)',
    completedDate: '2026-10-09',
    timeSpentMinutes: 22,
    needsRevision: false,
    notes: 'Indegree array + Queue for BFS. Detect cycle if output length != numCourses.',
  },
  {
    id: 'dsa-3',
    name: 'LRU Cache',
    platform: 'LeetCode',
    difficulty: 'Medium',
    topic: 'Hash Map + Doubly Linked List',
    completedDate: '2026-10-08',
    timeSpentMinutes: 30,
    needsRevision: true,
    notes: 'Always use dummy Head and Tail to eliminate null pointer checks during node splicing.',
  },
  {
    id: 'dsa-4',
    name: 'Word Break II',
    platform: 'LeetCode',
    difficulty: 'Hard',
    topic: 'Dynamic Programming / Backtracking + Memoization',
    completedDate: '2026-10-07',
    timeSpentMinutes: 45,
    needsRevision: true,
    notes: 'Must use memoization map <string, string[]> to avoid TLE on duplicate substrings.',
  },
  {
    id: 'dsa-5',
    name: 'Find Median from Data Stream',
    platform: 'LeetCode',
    difficulty: 'Hard',
    topic: 'Two Heaps (Max-Heap & Min-Heap)',
    completedDate: '2026-10-06',
    timeSpentMinutes: 35,
    needsRevision: false,
    notes: 'Balance sizes between maxHeap (smaller half) and minHeap (larger half). Rebalance when diff > 1.',
  },
];

export const INITIAL_BEHAVIORAL_STORIES: BehavioralStory[] = [
  {
    id: 'star-1',
    principle: 'Technical Disagreement & Have Backbone',
    title: 'Rejecting Synchronous Microservice Calls for Event-Driven Kafka',
    situation: 'Tech Lead wanted to call 4 microservices synchronously via REST during user checkout, causing 1400ms latency and cascade failures during traffic spikes.',
    task: 'I needed to convince the lead and architecture committee to decouple checkout using Kafka event streams without delaying the Q3 launch.',
    action: 'Created a reproducible benchmark showing 68% fail rate during peak load. Built a POC in 48 hours using transactional outbox pattern to publish order-placed events.',
    result: 'Reduced checkout latency from 1400ms to 85ms. System handled Black Friday peak of 40,000 RPM with 99.99% availability and zero lost transactions.',
    keyMetrics: '85ms P99 latency, 40k RPM, 99.99% availability.',
  },
  {
    id: 'star-2',
    principle: 'Ownership & Overcoming High Ambiguity',
    title: 'Resolving Silent Database Deadlock Incident During P0 Outage',
    situation: 'Core payment ledger experienced silent lock timeouts under high concurrency with no stack trace available in legacy logs.',
    task: 'Take charge of the incident triage, isolate the deadlock cause, and patch the database query without dropping in-flight payments.',
    action: 'Analyzed PostgreSQL pg_locks and transaction logs, identified inconsistent lock acquisition ordering between debit and balance-hold queries. Refactored queries to acquire locks in sorted account ID order.',
    result: 'Eliminated deadlock rate from 4.2% to 0.00%. Recovered all pending transactions with zero financial discrepancy.',
    keyMetrics: 'Zero deadlocks, $0 financial loss, resolved under 90 minutes.',
  },
];

export const getInitialStudySessions = (): SwitchStudySession[] => {
  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
  const twoDaysAgo = new Date(Date.now() - 172800000).toISOString().split('T')[0];

  return [
    // Today's sessions: Total ~ 4.5 hours currently logged
    {
      id: `sess-today-1`,
      date: today,
      durationMinutes: 150, // 2.5 hours
      category: 'dsa',
      topic: 'Graphs & Topological Sort (Course Schedule I & II, Alien Dictionary)',
      problemsSolved: 4,
      notes: 'Cracked Kahn BFS algorithm and cycle detection. Timing: ~25 mins per medium problem.',
      timestamp: `${today}T11:30:00.000Z`,
    },
    {
      id: `sess-today-2`,
      date: today,
      durationMinutes: 120, // 2.0 hours
      category: 'system-design',
      topic: 'HLD: Distributed Rate Limiter & Token Bucket with Redis Cluster',
      notes: 'Designed Lua script for atomic sliding window log in Redis. Evaluated memory consumption trade-offs.',
      timestamp: `${today}T14:45:00.000Z`,
    },

    // Yesterday's sessions: 7.8 hours (Non-stop grind executed!)
    {
      id: `sess-yest-1`,
      date: yesterday,
      durationMinutes: 210, // 3.5 hours
      category: 'dsa',
      topic: 'Dynamic Programming & Memoization Patterns (LCS, Edit Distance)',
      problemsSolved: 5,
      notes: 'Full non-stop morning block. Mastered 2D state transitions.',
      timestamp: `${yesterday}T12:00:00.000Z`,
    },
    {
      id: `sess-yest-2`,
      date: yesterday,
      durationMinutes: 150, // 2.5 hours
      category: 'system-design',
      topic: 'Distributed Message Queue (Kafka internals, zero-copy, log compaction)',
      notes: 'Deep dive into OS page cache and sequential disk I/O.',
      timestamp: `${yesterday}T16:00:00.000Z`,
    },
    {
      id: `sess-yest-3`,
      date: yesterday,
      durationMinutes: 110, // 1.8 hours (Total 7.8 hours)
      category: 'cs-fundamentals',
      topic: 'Database Concurrency & Isolation Levels (Read Committed vs Serializable)',
      notes: 'Reviewed Postgres MVCC snapshot isolation and phantom read edge cases.',
      timestamp: `${yesterday}T20:30:00.000Z`,
    },

    // Two days ago: 7.2 hours
    {
      id: `sess-prev-1`,
      date: twoDaysAgo,
      durationMinutes: 240, // 4 hours
      category: 'dsa',
      topic: 'Binary Trees, BST & Lowest Common Ancestor Variations',
      problemsSolved: 6,
      notes: 'Intense 4-hour non-stop marathon block.',
      timestamp: `${twoDaysAgo}T13:00:00.000Z`,
    },
    {
      id: `sess-prev-2`,
      date: twoDaysAgo,
      durationMinutes: 190, // 3.2 hours
      category: 'projects-resume',
      topic: 'Resume ATS Alignment & Quantifying System Metrics',
      notes: 'Rewrote 6 work experience bullet points using XYZ formula.',
      timestamp: `${twoDaysAgo}T18:00:00.000Z`,
    },
  ];
};
