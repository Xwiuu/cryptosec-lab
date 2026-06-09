import { create } from "zustand";
import type { ScannerFinding } from "@/types/scanner";

export type SimulationMode = "vulnerable" | "secure" | "compare";
export type RiskScoring = "conservative" | "balanced" | "aggressive";
export type DataSource = "mock" | "local_api";

interface LabState {
  simulationMode: SimulationMode;
  selectedNetwork: string;
  selectedWallet: string | null;
  riskScore: number;
  activeScenario: string | null;
  scannerFindings: ScannerFinding[];
  selectedSeverityFilter: string;
  selectedCategoryFilter: string;
  isMainnetBlocked: boolean;
  riskScoring: RiskScoring;
  dataSource: DataSource;

  setSimulationMode: (mode: SimulationMode) => void;
  setSelectedNetwork: (network: string) => void;
  setSelectedWallet: (wallet: string | null) => void;
  setActiveScenario: (scenario: string | null) => void;
  setRiskScoring: (mode: RiskScoring) => void;
  setDataSource: (source: DataSource) => void;
  updateRiskScore: (score: number) => void;
  toggleSecureMode: () => void;
  resetSimulation: () => void;
}

export const useLabStore = create<LabState>((set) => ({
  simulationMode: "vulnerable",
  selectedNetwork: "CryptoSec Localnet",
  selectedWallet: null,
  riskScore: 72,
  activeScenario: null,
  scannerFindings: [],
  selectedSeverityFilter: "all",
  selectedCategoryFilter: "all",
  isMainnetBlocked: true,
  riskScoring: "balanced",
  dataSource: "mock",

  setSimulationMode: (mode) => set({ simulationMode: mode }),
  setSelectedNetwork: (network) => set({ selectedNetwork: network }),
  setSelectedWallet: (wallet) => set({ selectedWallet: wallet }),
  setActiveScenario: (scenario) => set({ activeScenario: scenario }),
  setRiskScoring: (mode) => set({ riskScoring: mode }),
  setDataSource: (source) => set({ dataSource: source }),
  updateRiskScore: (score) => set({ riskScore: score }),
  toggleSecureMode: () =>
    set((state) => ({
      simulationMode: state.simulationMode === "secure" ? "vulnerable" : "secure",
    })),
  resetSimulation: () =>
    set({
      simulationMode: "vulnerable",
      riskScore: 72,
      activeScenario: null,
      selectedSeverityFilter: "all",
      selectedCategoryFilter: "all",
      riskScoring: "balanced",
      dataSource: "mock",
    }),
}));
