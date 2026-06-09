export const networkNodes = [
  { id: "node-01", name: "Validator Alpha", type: "validator" as const, status: "online" as const, chain: 184723, blocks: 184723, peers: 12, version: "v1.2.0", latency: 23, stake: 500_000, lastSeen: Date.now() },
  { id: "node-02", name: "Validator Beta", type: "validator" as const, status: "online" as const, chain: 184723, blocks: 184723, peers: 10, version: "v1.2.0", latency: 31, stake: 450_000, lastSeen: Date.now() },
  { id: "node-03", name: "Validator Gamma", type: "validator" as const, status: "online" as const, chain: 184723, blocks: 184723, peers: 14, version: "v1.2.0", latency: 18, stake: 380_000, lastSeen: Date.now() },
  { id: "node-04", name: "Node Aurora", type: "honest" as const, status: "online" as const, chain: 184723, blocks: 184723, peers: 8, version: "v1.1.5", latency: 45, stake: 0, lastSeen: Date.now() },
  { id: "node-05", name: "Node Borealis", type: "honest" as const, status: "online" as const, chain: 184723, blocks: 184723, peers: 9, version: "v1.1.5", latency: 52, stake: 0, lastSeen: Date.now() },
  { id: "node-06", name: "Attacker Node-01", type: "attacker" as const, status: "online" as const, chain: 184712, blocks: 184712, peers: 3, version: "v0.9.0", latency: 120, stake: 100_000, lastSeen: Date.now() },
  { id: "node-07", name: "Attacker Node-02", type: "attacker" as const, status: "online" as const, chain: 184712, blocks: 184712, peers: 3, version: "v0.9.0", latency: 135, stake: 80_000, lastSeen: Date.now() },
  { id: "node-08", name: "Node Offline-01", type: "honest" as const, status: "offline" as const, chain: 184700, blocks: 184700, peers: 0, version: "v1.1.4", latency: 0, stake: 0, lastSeen: Date.now() - 3600_000 },
  { id: "node-09", name: "Validator Delta", type: "validator" as const, status: "syncing" as const, chain: 184720, blocks: 184720, peers: 5, version: "v1.2.0", latency: 67, stake: 200_000, lastSeen: Date.now() - 600_000 },
  { id: "node-10", name: "Node Crimson", type: "honest" as const, status: "online" as const, chain: 184723, blocks: 184723, peers: 11, version: "v1.1.5", latency: 29, stake: 0, lastSeen: Date.now() },
  { id: "node-11", name: "Sybil Fake-01", type: "attacker" as const, status: "online" as const, chain: 184712, blocks: 184712, peers: 1, version: "v0.9.0", latency: 200, stake: 1_000, lastSeen: Date.now() },
  { id: "node-12", name: "Sybil Fake-02", type: "attacker" as const, status: "online" as const, chain: 184712, blocks: 184712, peers: 1, version: "v0.9.0", latency: 210, stake: 1_000, lastSeen: Date.now() },
];

export const nodeSummary = {
  total: 12,
  online: 9,
  offline: 1,
  syncing: 1,
  validators: 4,
  attackers: 4,
  honest: 5,
  sybilNodes: 2,
  avgLatency: 45,
};
