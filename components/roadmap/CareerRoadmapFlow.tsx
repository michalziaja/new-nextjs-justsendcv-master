"use client"

import { useCallback, useMemo } from 'react';
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  Node,
  Edge,
  BackgroundVariant,
  Position,
  MarkerType,
  Handle,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Target, CheckCircle, Book, Award, Users, Code, PlayCircle } from "lucide-react";

// Interfejsy dla struktury danych ścieżki kariery
interface SubStep {
  id: string;
  title: string;
  description: string;
  type: 'course' | 'project' | 'certification' | 'networking' | 'practice' | 'book' | 'public';
  estimated_weeks: number;
  cost_range?: string;
  resources?: string[];
}

interface CareerStep {
  id: string;
  title: string;
  description?: string; // Opcjonalne - może być zastąpione przez goal
  goal?: string; // Nowe pole - cel kroku
  timeframe?: string; // Opcjonalne dla kompatybilności
  skills_required?: string[]; // Opcjonalne dla kompatybilności  
  estimated_months?: number; // Opcjonalne dla kompatybilności
  sub_steps?: SubStep[]; // Stara nazwa dla kompatybilności
  substeps?: SubStep[]; // Nowa nazwa
}

interface CareerPath {
  title: string;
  description: string;
  type: 'evolutionary' | 'transformational';
  timeline: number;
  steps: CareerStep[];
  target_salary_range: string;
  difficulty: number;
  market_demand: number;
  specialization_branches?: Array<{
    id: string;
    title: string;
    description: string;
    final_step: CareerStep;
  }>;
}

interface CareerRoadmapFlowProps {
  careerPath: CareerPath;
}

// Funkcja zwracająca odpowiednią ikonę dla typu sub-kroku
const getSubStepIcon = (type: string) => {
  switch (type) {
    case 'course': return <Book className="h-3 w-3" />;
    case 'certification': return <Award className="h-3 w-3" />;
    case 'networking': return <Users className="h-3 w-3" />;
    case 'project': return <Code className="h-3 w-3" />;
    case 'practice': return <PlayCircle className="h-3 w-3" />;
    case 'book': return <Book className="h-3 w-3" />;
    case 'public': return <Users className="h-3 w-3" />;
    default: return <Book className="h-3 w-3" />;
  }
};

// Funkcja zwracająca odpowiedni kolor dla typu sub-kroku
const getSubStepColor = (type: string) => {
  switch (type) {
    case 'course': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300';
    case 'certification': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300';
    case 'networking': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
    case 'project': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300';
    case 'practice': return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
    case 'book': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300';
    case 'public': return 'bg-pink-100 text-pink-800 dark:bg-pink-900/20 dark:text-pink-300';
    default: return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300';
  }
};

// Custom node component dla głównych kroków
const CareerStepNode = ({ data }: { data: any }) => {
  const isCompleted = data?.completed || false;
  const isCurrent = data?.current || false;
  
  // Pobierz substeps z dwóch możliwych nazw
  const subSteps = data?.sub_steps || data?.substeps || [];
  
  return (
    <>
      {/* Handle'y dla połączeń */}
      <Handle type="target" position={Position.Bottom} />
      <Handle type="source" position={Position.Top} />
      <Handle type="source" position={Position.Left} id="left" />
      <Handle type="source" position={Position.Right} id="right" />
      
      <Card className={`w-96 ${isCurrent ? 'ring-2 ring-blue-500' : ''} ${isCompleted ? 'bg-green-50 dark:bg-green-900/20' : ''}`}>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold">{data?.title || 'Krok kariery'}</CardTitle>
            {isCompleted && <CheckCircle className="h-4 w-4 text-green-500" />}
            {isCurrent && <Target className="h-4 w-4 text-blue-500" />}
          </div>
          <CardDescription className="text-xs">
            {data?.goal || data?.description || 'Cel kroku kariery'}
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0 space-y-3">
          {data?.timeframe && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              <span>{data.timeframe} • {data?.estimated_months || 0} miesięcy</span>
            </div>
          )}
          
          {data?.skills_required && data.skills_required.length > 0 && (
            <div className="space-y-1">
              <p className="text-xs font-medium">Kluczowe umiejętności:</p>
              <div className="flex flex-wrap gap-1">
                {data.skills_required.slice(0, 3).map((skill: string, index: number) => (
                  <Badge key={index} variant="secondary" className="text-xs px-1 py-0">
                    {skill}
                  </Badge>
                ))}
                {data.skills_required.length > 3 && (
                  <Badge variant="outline" className="text-xs px-1 py-0">
                    +{data.skills_required.length - 3}
                  </Badge>
                )}
              </div>
            </div>
          )}

          {subSteps.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-medium">Działania do wykonania:</p>
              <div className="space-y-1 max-h-24 overflow-y-auto">
                {subSteps.map((subStep: SubStep, index: number) => (
                  <div key={index} className="flex items-center gap-2 p-1 rounded text-xs">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full ${getSubStepColor(subStep?.type || 'course')}`}>
                      {getSubStepIcon(subStep?.type || 'course')}
                      {subStep?.type || 'course'}
                    </span>
                    <span className="flex-1 truncate">{subStep?.title || 'Działanie'}</span>
                    {subStep?.cost_range && (
                      <span className="text-green-600 font-medium">{subStep.cost_range}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
};

// Custom node dla specjalizacji (rozwidlenia)
const SpecializationNode = ({ data }: { data: any }) => {
  return (
    <Card className="w-80 bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 border-purple-200 dark:border-purple-800">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <Award className="h-4 w-4 text-purple-500" />
          {data?.title || 'Specjalizacja'}
        </CardTitle>
        <CardDescription className="text-xs">
          {data?.goal || data?.description || 'Opis specjalizacji'}
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-2">
          {data?.timeframe && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              <span>{data.timeframe}</span>
            </div>
          )}
          
          {data?.skills_required && data.skills_required.length > 0 && (
            <div className="space-y-1">
              <p className="text-xs font-medium">Specjalistyczne umiejętności:</p>
              <div className="flex flex-wrap gap-1">
                {data.skills_required.slice(0, 4).map((skill: string, index: number) => (
                  <Badge key={index} className="text-xs px-1 py-0 bg-purple-100 text-purple-800">
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

const nodeTypes = {
  careerStep: CareerStepNode,
  specialization: SpecializationNode,
};

export function CareerRoadmapFlow({ careerPath }: CareerRoadmapFlowProps) {
  // Zabezpieczenie przed undefined lub pustym careerPath
  if (!careerPath || !careerPath.steps || careerPath.steps.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-center text-muted-foreground">
          <p>Brak danych do wyświetlenia ścieżki kariery</p>
        </div>
      </div>
    );
  }

  // Generate nodes and edges from career path
  const { initialNodes, initialEdges } = useMemo(() => {
    const nodes: Node[] = [];
    const edges: Edge[] = [];
    
    // Start node - na dole
    nodes.push({
      id: 'start',
      type: 'input',
      position: { x: 0, y: 0 }, // Dół ekranu, wycentrowany
      data: { 
        label: 'START',
      },
      style: {
        background: '#10b981',
        color: 'white',
        border: '2px solid #059669',
        borderRadius: '8px',
        fontSize: '12px',
        fontWeight: 'bold',
        width: 100,
        height: 40,
      },
      sourcePosition: Position.Top, // Połączenie w górę
    });

    // Główne kroki ścieżki kariery - pionowo od dołu do góry
    const mainStepsCount = careerPath.steps?.length || 0;
    const stepHeight = 350; // Znacznie zwiększony odstęp między krokami
    const mainPathX = 0; // Pozycja X głównej ścieżki - wycentrowana
    
    // Określenie punktu rozgałęzienia (po 3-4 krokach)
    const branchPoint = Math.min(4, Math.max(3, Math.floor(mainStepsCount / 2)));
    
    careerPath.steps?.forEach((step, index) => {
      const nodeId = `step-${index}`;
      
      // Sprawdź czy to kroki przed rozgałęzieniem
      if (index < branchPoint) {
        // Główna ścieżka przed rozgałęzieniem
        const yPosition = -(index + 1) * stepHeight;
        
        nodes.push({
          id: nodeId,
          type: 'careerStep',
          position: { x: mainPathX, y: yPosition },
          data: {
            ...step,
            current: index === 0,
            completed: false,
          },
          sourcePosition: Position.Top,
          targetPosition: Position.Bottom,
        });

        // Połączenie od START do pierwszego kroku lub od poprzedniego kroku
        const sourceId = index === 0 ? 'start' : `step-${index - 1}`;
        edges.push({
          id: `edge-${sourceId}-${nodeId}`,
          source: sourceId,
          target: nodeId,
          animated: index === 0,
          style: { stroke: '#6366f1', strokeWidth: 3 },
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: '#6366f1',
          },
        });
        
      } else {
        // Kroki po rozgałęzieniu - podziel na 2 ścieżki
        const stepsAfterBranch = mainStepsCount - branchPoint;
        const leftSteps = Math.ceil(stepsAfterBranch / 2);
        const rightSteps = stepsAfterBranch - leftSteps;
        
        const stepIndexAfterBranch = index - branchPoint;
        
        if (stepIndexAfterBranch < leftSteps) {
          // Lewa ścieżka
          const yPosition = -(branchPoint + 1 + stepIndexAfterBranch) * stepHeight;
          const xPosition = -400; // Lewa strona
          
          nodes.push({
            id: nodeId,
            type: 'careerStep',
            position: { x: xPosition, y: yPosition },
            data: {
              ...step,
              current: false,
              completed: false,
            },
            sourcePosition: Position.Top,
            targetPosition: Position.Bottom,
          });

          // Połączenie od punktu rozgałęzienia lub poprzedniego kroku w lewej ścieżce
          const sourceId = stepIndexAfterBranch === 0 ? `step-${branchPoint - 1}` : `step-${index - 1}`;
          const sourceHandle = stepIndexAfterBranch === 0 ? 'left' : undefined;
          
          edges.push({
            id: `edge-${sourceId}-${nodeId}`,
            source: sourceId,
            target: nodeId,
            style: { stroke: '#8b5cf6', strokeWidth: 3 },
            sourceHandle,
            markerEnd: {
              type: MarkerType.ArrowClosed,
              color: '#8b5cf6',
            },
          });
          
        } else {
          // Prawa ścieżka
          const rightStepIndex = stepIndexAfterBranch - leftSteps;
          const yPosition = -(branchPoint + 1 + rightStepIndex) * stepHeight;
          const xPosition = 400; // Prawa strona
          
          nodes.push({
            id: nodeId,
            type: 'careerStep',
            position: { x: xPosition, y: yPosition },
            data: {
              ...step,
              current: false,
              completed: false,
            },
            sourcePosition: Position.Top,
            targetPosition: Position.Bottom,
          });

          // Połączenie od punktu rozgałęzienia lub poprzedniego kroku w prawej ścieżce
          const sourceId = rightStepIndex === 0 ? `step-${branchPoint - 1}` : `step-${index - 1}`;
          const sourceHandle = rightStepIndex === 0 ? 'right' : undefined;
          
          edges.push({
            id: `edge-${sourceId}-${nodeId}`,
            source: sourceId,
            target: nodeId,
            style: { stroke: '#f59e0b', strokeWidth: 3 },
            sourceHandle,
            markerEnd: {
              type: MarkerType.ArrowClosed,
              color: '#f59e0b',
            },
          });
        }
      }

      // Sub-kroki jako odnogi w bok
      const subSteps = step.sub_steps || step.substeps || [];
      if (subSteps.length > 0) {
        let stepXPosition = mainPathX;
        let stepYPosition = -(index + 1) * stepHeight;
        
        // Dostosuj pozycję sub-kroków dla rozgałęzionych ścieżek
        if (index >= branchPoint) {
          const stepsAfterBranch = mainStepsCount - branchPoint;
          const leftSteps = Math.ceil(stepsAfterBranch / 2);
          const stepIndexAfterBranch = index - branchPoint;
          
          if (stepIndexAfterBranch < leftSteps) {
            stepXPosition = -400; // Lewa ścieżka
          } else {
            stepXPosition = 400; // Prawa ścieżka
          }
          
          stepYPosition = -(branchPoint + 1 + (stepIndexAfterBranch < leftSteps ? stepIndexAfterBranch : stepIndexAfterBranch - leftSteps)) * stepHeight;
        }
        
        subSteps.forEach((subStep, subIndex) => {
          const subStepId = `substep-${index}-${subIndex}`;
          const subStepX = stepXPosition + (subIndex % 2 === 0 ? -300 : 300);
          const subStepY = stepYPosition + (subIndex - subSteps.length / 2) * 100;
          
          nodes.push({
            id: subStepId,
            type: 'default',
            position: { x: subStepX, y: subStepY },
            data: {
              label: (
                <div className="text-xs p-2 bg-white border rounded-lg shadow-sm min-w-[200px]">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full ${getSubStepColor(subStep.type)}`}>
                      {getSubStepIcon(subStep.type)}
                      {subStep.type}
                    </span>
                  </div>
                  <p className="font-semibold">{subStep.title}</p>
                  <p className="text-muted-foreground">{subStep.description}</p>
                  {subStep.cost_range && (
                    <p className="text-green-600 font-medium mt-1">{subStep.cost_range}</p>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">{subStep.estimated_weeks} tygodni</p>
                </div>
              )
            },
            style: {
              background: 'transparent',
              border: 'none',
            },
            targetPosition: subIndex % 2 === 0 ? Position.Right : Position.Left,
          });

          // Połączenie od głównego kroku do sub-kroku
          edges.push({
            id: `edge-${nodeId}-${subStepId}`,
            source: nodeId,
            target: subStepId,
            style: { stroke: '#94a3b8', strokeWidth: 2, strokeDasharray: '5,5' },
            sourceHandle: subIndex % 2 === 0 ? 'left' : 'right',
            markerEnd: {
              type: MarkerType.ArrowClosed,
              color: '#94a3b8',
            },
          });
        });
      }
    });

    // End nodes dla obu ścieżek
    if (mainStepsCount > branchPoint) {
      const stepsAfterBranch = mainStepsCount - branchPoint;
      const leftSteps = Math.ceil(stepsAfterBranch / 2);
      const rightSteps = stepsAfterBranch - leftSteps;
      
      // End node dla lewej ścieżki
      if (leftSteps > 0) {
        const leftEndY = -(branchPoint + 1 + leftSteps) * stepHeight;
        nodes.push({
          id: 'end-left',
          type: 'output',
          position: { x: -400, y: leftEndY },
          data: { 
            label: `SUKCES!\nSpecjalizacja A`,
          },
          style: {
            background: '#8b5cf6',
            color: 'white',
            border: '2px solid #7c3aed',
            borderRadius: '8px',
            fontSize: '12px',
            fontWeight: 'bold',
            width: 120,
            height: 60,
            textAlign: 'center',
          },
          targetPosition: Position.Bottom,
        });

        // Połączenie od ostatniego kroku lewej ścieżki
        const lastLeftStepIndex = branchPoint + leftSteps - 1;
        edges.push({
          id: `edge-step-${lastLeftStepIndex}-end-left`,
          source: `step-${lastLeftStepIndex}`,
          target: 'end-left',
          style: { stroke: '#8b5cf6', strokeWidth: 3 },
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: '#8b5cf6',
          },
        });
      }
      
      // End node dla prawej ścieżki
      if (rightSteps > 0) {
        const rightEndY = -(branchPoint + 1 + rightSteps) * stepHeight;
        nodes.push({
          id: 'end-right',
          type: 'output',
          position: { x: 400, y: rightEndY },
          data: { 
            label: `SUKCES!\nSpecjalizacja B`,
          },
          style: {
            background: '#f59e0b',
            color: 'white',
            border: '2px solid #d97706',
            borderRadius: '8px',
            fontSize: '12px',
            fontWeight: 'bold',
            width: 120,
            height: 60,
            textAlign: 'center',
          },
          targetPosition: Position.Bottom,
        });

        // Połączenie od ostatniego kroku prawej ścieżki
        const lastRightStepIndex = mainStepsCount - 1;
        edges.push({
          id: `edge-step-${lastRightStepIndex}-end-right`,
          source: `step-${lastRightStepIndex}`,
          target: 'end-right',
          style: { stroke: '#f59e0b', strokeWidth: 3 },
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: '#f59e0b',
          },
        });
      }
    } else {
      // Pojedynczy end node jeśli nie ma rozgałęzienia
      const endY = -(mainStepsCount + 1) * stepHeight;
      
      nodes.push({
        id: 'end',
        type: 'output',
        position: { x: mainPathX, y: endY },
        data: { 
          label: `SUKCES!\n${careerPath.target_salary_range || 'Cel osiągnięty'}`,
        },
        style: {
          background: '#8b5cf6',
          color: 'white',
          border: '2px solid #7c3aed',
          borderRadius: '8px',
          fontSize: '12px',
          fontWeight: 'bold',
          width: 120,
          height: 60,
          textAlign: 'center',
        },
        targetPosition: Position.Bottom,
      });

      // Połączenie od ostatniego kroku do end
      if (mainStepsCount > 0) {
        edges.push({
          id: `edge-step-${mainStepsCount - 1}-end`,
          source: `step-${mainStepsCount - 1}`,
          target: 'end',
          style: { stroke: '#8b5cf6', strokeWidth: 3 },
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: '#8b5cf6',
          },
        });
      }
    }

    return {
      initialNodes: nodes,
      initialEdges: edges,
    };
  }, [careerPath]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    console.log('Kliknięto node:', node);
    // Można dodać modal z szczegółami kroku/sub-kroków
  }, []);

  // Viewport domyślny - pokazuj START node na dole ekranu
  const defaultViewport = {
    x: 250, // Wycentrowany dla pełnej szerokości
    y: 200, // Widok START node
    zoom: 0.8 // Lepszy zoom dla pełnej szerokości
  };

  return (
    <div className="w-full h-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={onNodeClick}
        nodeTypes={nodeTypes}
        defaultViewport={defaultViewport}
        fitView={false} // Wyłącz automatyczne dopasowanie
        className="bg-gray-50 dark:bg-gray-900"
      >
        <Controls />
        <MiniMap />
        <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
      </ReactFlow>
    </div>
  );
} 