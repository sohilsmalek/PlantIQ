/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Sidebar, NavigationPage } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { PlantOverview } from './pages/PlantOverview';
import { PartsBOM } from './pages/PartsBOM';
import { MachinesSpares } from './pages/MachinesSpares';
import { InventoryForecast } from './pages/InventoryForecast';
import { SuppliersOrders } from './pages/SuppliersOrders';
import { ScenarioSimulator } from './pages/ScenarioSimulator';
import { AICopilot } from './pages/AICopilot';
import { ReportsSettings } from './pages/ReportsSettings';
import { DatabaseManager } from './pages/DatabaseManager';
import { CSVImportModal } from './components/database/CSVImportModal';
import { DatabaseProvider, usePlantDatabase } from './context/DatabaseContext';

function PlantIQApp() {
  const [currentPage, setCurrentPage] = useState<NavigationPage>('plant-overview');

  const {
    components,
    machines,
    oemOrders,
    suppliers,
    purchaseOrders,
    spares,
    planningResult,
    activeAlertsCount,
    isCustomDatabase,
    isImportModalOpen,
    activeModalTable,
    closeImportModal
  } = usePlantDatabase();

  const [selectedPartNumber, setSelectedPartNumber] = useState<string>('SEN-2048');
  const [selectedMachineId, setSelectedMachineId] = useState<string>('M-ASSY-03');

  // Guard against missing selections if user uploads a new custom database
  const activePartNumber = components.some((c) => c.partNumber === selectedPartNumber)
    ? selectedPartNumber
    : components[0]?.partNumber || 'SEN-2048';

  const activeMachineId = machines.some((m) => m.id === selectedMachineId)
    ? selectedMachineId
    : machines[0]?.id || 'M-ASSY-03';

  const handleSelectComponent = (partNumber: string) => {
    setSelectedPartNumber(partNumber);
    setCurrentPage('parts-bom');
  };

  const handleSelectMachine = (machineId: string) => {
    setSelectedMachineId(machineId);
    setCurrentPage('machines-spares');
  };

  return (
    <div className="min-h-screen bg-[#F3F6FB] text-[#172B4D] antialiased">
      {/* Fixed Dark Navy Sidebar (230px wide) */}
      <Sidebar
        currentPage={currentPage}
        onNavigate={setCurrentPage}
        criticalShortagesCount={planningResult.criticalShortagesCount}
        machineAlertsCount={activeAlertsCount}
        isCustomDatabase={isCustomDatabase}
      />

      {/* Main Content Area offset by Sidebar width */}
      <div className="pl-[230px] flex flex-col min-h-screen">
        {/* Top Header */}
        <Header
          onNavigate={setCurrentPage}
          onSelectComponent={handleSelectComponent}
          onSelectMachine={handleSelectMachine}
          unreadAlertsCount={activeAlertsCount}
        />

        {/* Dynamic Page Content */}
        <main className="flex-1 p-6 max-w-7xl w-full mx-auto">
          {currentPage === 'plant-overview' && (
            <PlantOverview
              planningResult={planningResult}
              components={components}
              machines={machines}
              oemOrders={oemOrders}
              onNavigate={setCurrentPage}
              onSelectComponent={handleSelectComponent}
              onSelectMachine={handleSelectMachine}
            />
          )}

          {currentPage === 'database-csv' && (
            <DatabaseManager
              onSelectComponent={handleSelectComponent}
              onSelectMachine={handleSelectMachine}
              onNavigateToParts={() => setCurrentPage('parts-bom')}
              onNavigateToMachines={() => setCurrentPage('machines-spares')}
            />
          )}

          {currentPage === 'parts-bom' && (
            <PartsBOM
              components={components}
              selectedPartNumber={activePartNumber}
              onSelectComponent={setSelectedPartNumber}
              onNavigateToSimulator={() => setCurrentPage('scenario-simulator')}
            />
          )}

          {currentPage === 'machines-spares' && (
            <MachinesSpares
              machines={machines}
              spares={spares}
              selectedMachineId={activeMachineId}
              onSelectMachine={setSelectedMachineId}
              onSelectPart={handleSelectComponent}
            />
          )}

          {currentPage === 'inventory-forecasts' && (
            <InventoryForecast
              planningResult={planningResult}
              onSelectComponent={handleSelectComponent}
              onNavigateToParts={() => setCurrentPage('parts-bom')}
              onNavigateToSimulator={() => setCurrentPage('scenario-simulator')}
            />
          )}

          {currentPage === 'suppliers-orders' && (
            <SuppliersOrders
              suppliers={suppliers}
              purchaseOrders={purchaseOrders}
              onSelectComponent={handleSelectComponent}
              onNavigateToParts={() => setCurrentPage('parts-bom')}
            />
          )}

          {currentPage === 'scenario-simulator' && (
            <ScenarioSimulator
              components={components}
              machines={machines}
              oemOrders={oemOrders}
              onSelectComponent={handleSelectComponent}
              onNavigateToParts={() => setCurrentPage('parts-bom')}
            />
          )}

          {currentPage === 'ai-copilot' && (
            <AICopilot
              onSelectComponent={handleSelectComponent}
              onSelectMachine={handleSelectMachine}
              onNavigateToParts={() => setCurrentPage('parts-bom')}
              onNavigateToMachines={() => setCurrentPage('machines-spares')}
              onNavigateToSuppliers={() => setCurrentPage('suppliers-orders')}
            />
          )}

          {currentPage === 'reports-settings' && (
            <ReportsSettings
              planningResult={planningResult}
              onNavigateToDatabase={() => setCurrentPage('database-csv')}
            />
          )}
        </main>
      </div>

      {/* Global CSV Import Modal */}
      <CSVImportModal
        isOpen={isImportModalOpen}
        onClose={closeImportModal}
        defaultTable={activeModalTable}
      />
    </div>
  );
}

export default function App() {
  return (
    <DatabaseProvider>
      <PlantIQApp />
    </DatabaseProvider>
  );
}
