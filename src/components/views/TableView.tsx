import React, { useState } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { Board, Card, UpdateCardRequest, Label } from '../../models';
import { GripVertical } from 'lucide-react';
import { cardService } from '../../services/cardService';
import { labelService } from '../../services/labelService';
import { useNotification } from '../../hooks/useNotification';
import { useSyncContext } from '../../contexts/SyncContext';
import { getPriorityFromLabels, formatDueDate } from '@/utils/textUtils';
import { InlineEdit } from '@/components/ui/InlineEdit';
import { TruncatedInlineEdit } from '@/components/ui/TruncatedInlineEdit';
import { useBoardPermissions } from '../../hooks/useBoardPermissions';
import { clsx } from 'clsx';

interface TableViewProps {
  board: Board;
  onCardClick: (card: Card) => void;
  onBoardUpdate: () => void;
}

interface ExtendedCard extends Card {
  listName: string;
  listId: number;
  label_ids?: number[];
}

export const TableView: React.FC<TableViewProps> = ({ board, onCardClick, onBoardUpdate }) => {
  // Inline edit removed for table view to simplify mobile rendering
  const { showNotification } = useNotification();
  const { startSync, endSync } = useSyncContext();
  const { canEdit } = useBoardPermissions(board.id);
  // notification already available as showNotification
  const { boardUsers } = useBoardPermissions(board.id);

  // Estado optimista para la tabla
  const [optimisticCards, setOptimisticCards] = useState<ExtendedCard[]>([]);
  // Global labels (to mirror CardModal behaviour for priorities)
  const [globalLabels, setGlobalLabels] = useState<Label[]>([]);

  // Actualizar estado optimista cuando cambia el board
  React.useEffect(() => {
    // Agrupar listas por nombre para que en la vista tabla queden juntas por "tipo/categoría"
    const sortedLists = (board.lists || []).slice().sort((a, b) => a.name.localeCompare(b.name));
    const currentCards: ExtendedCard[] = sortedLists.flatMap(list =>
      (list.cards?.sort((a, b) => a.position - b.position).map(card => ({
        ...card,
        listName: list.name,
        listId: list.id,
  // Derivar label_ids si el backend no los provee explícitamente
  label_ids: ((card as unknown) as { label_ids?: number[] }).label_ids ?? card.labels?.map(l => l.id) ?? []
      })) || [])
    );
    setOptimisticCards(currentCards);
  }, [board]);

  // Dev debug logs removed in production commit

  // No label preloading in table view; priorities are derived from card.labels when present

  // Helper function para revertir cambios optimistas
  const revertOptimisticChanges = () => {
    const sortedLists = (board.lists || []).slice().sort((a, b) => a.name.localeCompare(b.name));
    const currentCards: ExtendedCard[] = sortedLists.flatMap(list => 
      (list.cards?.slice().sort((a, b) => a.position - b.position).map(card => ({ ...card, listName: list.name, listId: list.id })) || [])
    );
    setOptimisticCards(currentCards);
  };

  // Load global labels so we can map priorities the same way CardModal does
  React.useEffect(() => {
    // Prefer labels embedded in the board prop (cards may include their labels).
    // Some backends return board-level labels endpoint empty while cards include labels.
    if (board?.labels && board.labels.length > 0) {
      setGlobalLabels(board.labels || []);
      return;
    }
    // If board-level labels are absent, try to derive labels embedded inside cards
    type EmbeddedLabel = { id: number; name?: string; color?: string; priority?: string; board_id?: number | null; created_at?: string; updated_at?: string };
    const embeddedRaw = (board.lists || [])
      .flatMap(list => list.cards || [])
      .flatMap(card => card.labels || [] as EmbeddedLabel[]);

    const unique: Record<number, EmbeddedLabel> = {};
    for (const lab of embeddedRaw) {
      if (!unique[lab.id]) unique[lab.id] = lab;
    }

    const embeddedLabels: Label[] = Object.values(unique).map(l => ({
      id: l.id,
      name: l.name || '',
      color: l.color || '#6B7280',
      board_id: l.board_id ?? null,
      created_at: l.created_at ?? new Date().toISOString(),
      updated_at: l.updated_at ?? new Date().toISOString(),
      priority: l.priority as Label['priority'] | undefined
    } as Label));

    if (embeddedLabels && embeddedLabels.length > 0) {
      setGlobalLabels(embeddedLabels);
      return;
    }

    // Fallback: attempt to load board-scoped labels only if no embedded labels were found
    let mounted = true;
    const load = async () => {
      try {
  if (!board?.id) return;
  const labels = await labelService.getAllLabels();
  if (mounted) setGlobalLabels(labels || []);
      } catch (err) {
        console.error('Error loading global labels for TableView:', err);
      }
    };
    load();
    return () => { mounted = false; };
  }, [board]);

  // Helpers to map priority <-> label id (copied logic from CardModal)
  // Note: mapping from priority->label id is now handled by CardModal/TableView using globalLabels directly

  const getPriorityFromLabelId = (labelId: number): 'baja' | 'media' | 'alta' | 'extremo' => {
    const label = globalLabels.find(l => l.id === labelId);
    if (!label) return 'media';

    const labelName = (label.name || '').toLowerCase();
    if (labelName.includes('bajo') || labelName.includes('baja')) return 'baja';
    if (labelName.includes('medio') || labelName.includes('media')) return 'media';
    if (labelName.includes('alto') || labelName.includes('alta')) return 'alta';
    if (labelName.includes('extremo')) return 'extremo';
    return 'media';
  };

  // Compute visible priority object for a card using card.labels or fallback to label_ids + globalLabels
  const computePriorityForCard = (card: ExtendedCard) => {
    // Prefer explicit labels on the card
    if (card.labels && card.labels.length > 0) {
      return getPriorityFromLabels(card.labels);
    }

    // Fallback to label_ids if present
    const labelIds = ((card as unknown) as { label_ids?: number[] }).label_ids;
    if (labelIds && labelIds.length > 0) {
      // Prefer globalLabels (loaded via service), if not loaded try board.labels if available
      let label;
      if (globalLabels && globalLabels.length > 0) {
        label = globalLabels.find(l => l.id === labelIds[0]);
      }
      if (!label && board && board.labels && board.labels.length > 0) {
        label = board.labels.find(l => l.id === labelIds[0]);
      }
      if (label) return getPriorityFromLabels([{ name: label.name || '', color: label.color || '#6B7280' }]);
    }

    // Final fallback to card.priority or empty
    if ((card as Card).priority) {
      const pr = (card as Card).priority as 'baja' | 'media' | 'alta' | 'extremo';
      const text = pr === 'alta' ? 'Alta' : pr === 'media' ? 'Media' : pr === 'baja' ? 'Baja' : 'Extremo';
      const color = pr === 'alta' ? '#ef4444' : pr === 'media' ? '#f59e0b' : pr === 'baja' ? '#10b981' : '#7c3aed';
      return { priority: pr, color, text };
    }

    return { priority: null, color: '#6B7280', text: '' };
  };

  // Helper function para reordenar optimísticamente
  const reorderCardsOptimistically = (sourceIndex: number, destIndex: number): ExtendedCard[] => {
    const newCards = [...optimisticCards];
    const [movedCard] = newCards.splice(sourceIndex, 1);
    newCards.splice(destIndex, 0, movedCard);

    // Determinar nuevo listId para la tarjeta movida basándonos en vecinos
    let newListId = movedCard.listId;
    if (newCards[destIndex - 1]) {
      newListId = newCards[destIndex - 1].listId;
    } else if (newCards[destIndex + 1]) {
      newListId = newCards[destIndex + 1].listId;
    }

    movedCard.listId = newListId;
    movedCard.listName = board.lists?.find(l => l.id === newListId)?.name || movedCard.listName;

    // Actualizar posiciones por lista (posición relativa dentro de cada lista)
    const counts: Record<number, number> = {};
    newCards.forEach((card) => {
      counts[card.listId] = (counts[card.listId] || 0) + 1;
      card.position = counts[card.listId];
    });

    return newCards;
  };

  // inline edit and list-change helpers removed for simplicity in table view

  const handleUpdateCard = async (cardId: number, cardData: { title?: string; description?: string }) => {
    startSync(`update-card-${cardId}`);
    try {
      const updated = await cardService.updateCard(cardId, cardData);
      // Update optimistic state with server response
      setOptimisticCards(prev => prev.map(c => c.id === updated.id ? ({ ...c, ...updated, listId: updated.board_list_id ?? c.listId }) as ExtendedCard : c));
      showNotification('success', 'Tarjeta actualizada correctamente');
      // Wait for parent refetch so other views (Kanban/modal) reflect the change
      await onBoardUpdate();
    } catch (error) {
      console.error('Error updating card from inline edit:', error);
      showNotification('error', error instanceof Error ? error.message : 'Error al actualizar la tarjeta');
      // revert by refetch
      onBoardUpdate();
      throw error;
    } finally {
      endSync(`update-card-${cardId}`);
    }
  };

  // Función para manejar drag & drop con actualizaciones optimistas
  const handleDragEnd = async (result: DropResult) => {
    // Si el usuario no puede editar, no permitir drag & drop
    if (!canEdit) return;

    if (!result.destination) return;

  const sourceIndex = result.source.index;
  const destIndex = result.destination.index;
  const cardId = parseInt(result.draggableId);
    
    // Si no cambió de posición, no hacer nada
    if (sourceIndex === destIndex) return;

  // 1. Aplicar cambio optimista inmediatamente
  const newCards = reorderCardsOptimistically(sourceIndex, destIndex);
  setOptimisticCards(newCards);

    try {
      // 2. Hacer la petición al backend en segundo plano
      startSync(`reorder-card-${cardId}`);
      // Usar el nuevo array optimista para derivar el listId (está actualizado)
      const movedCard = newCards.find(c => c.id === cardId);
      const listId = movedCard?.listId;

      // Debug info: show indexes, moved card position, neighbors and list positions
      const destListPositions = newCards.filter(c => c.listId === listId).map(c => ({ id: c.id, position: c.position }));
      const neighborBefore = newCards[destIndex - 1] ? { id: newCards[destIndex - 1].id, listId: newCards[destIndex - 1].listId } : null;
      const neighborAfter = newCards[destIndex + 1] ? { id: newCards[destIndex + 1].id, listId: newCards[destIndex + 1].listId } : null;
      console.debug('[TableView] drag debug', { sourceIndex, destIndex, cardId, listId, movedCardPosition: movedCard?.position, neighborBefore, neighborAfter, destListPositions });

      // Debug extra para list_id === 5 (investigar comportamiento específico)
      if (import.meta.env.DEV && listId === 5) {
        console.group('[TableView] VERBOSE DEBUG for list 5');
        console.debug('newCards (full aplanado):', newCards.map(c => ({ id: c.id, listId: c.listId, position: c.position, title: c.title })));
        const boardList = board.lists?.find(l => l.id === 5);
        console.debug('board.lists.find(5):', boardList);
        console.debug('destListPositions (detailed):', destListPositions);
        console.groupEnd();
      }

      // Calculate position as number of cards in the destination list up to destIndex (inclusive)
      const positionInDest = newCards.slice(0, destIndex + 1).filter(c => c.listId === listId).length;
      const payload = {
        position: positionInDest || (movedCard?.position ?? (destIndex + 1)),
        ...(listId ? { list_id: listId } : {})
      };
      console.debug('[TableView] reorder payload:', { cardId, payload });

  const updated = await cardService.updateCard(cardId, payload as UpdateCardRequest);
      console.debug('[TableView] updateCard response:', updated);

      // 3. Si es exitoso, mostrar notificación sutil
      showNotification('success', 'Orden actualizado');

      // Actualizar el estado optimista con la respuesta del servidor antes de refetchear
      setOptimisticCards(prev => prev.map(c => c.id === updated.id ? ({ ...c, ...updated, listId: (updated.board_list_id ?? c.listId) }) as ExtendedCard : c));

      // Actualizar datos reales en background (refetch) tras una pequeña espera
      setTimeout(() => {
        onBoardUpdate();
        endSync(`reorder-card-${cardId}`);
      }, 300);
      
    } catch (error) {
      console.error('Error reordering card:', error);
      console.warn('Card reorder operation failed. Reverting optimistic changes.');
      
      // 4. Si falla, revertir el cambio optimista y mostrar error
      revertOptimisticChanges();
      showNotification('error', 'Error al reordenar la tarjeta');
      endSync(`reorder-card-${cardId}`);
    }
  };

  return (
  <div className="p-4 sm:p-6 h-full overflow-auto">
  {/* helper to find user names with typing to avoid any */}
  <div style={{ display: 'none' }} />
      {/* Mobile stacked list */}
      <div className="space-y-3 sm:hidden">
        {optimisticCards.map((card) => (
          <div key={`mobile-${card.id}`} className="bg-white shadow rounded-lg p-3">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <InlineEdit
                  value={card.title}
                  onSave={(newTitle) => handleUpdateCard(card.id, { title: newTitle })}
                  disabled={!canEdit}
                  className="text-sm font-medium text-gray-900"
                  placeholder="Sin título"
                />
                <div className="text-xs text-gray-500">{board.lists?.find(l => l.id === card.listId)?.name}</div>
              </div>
              <div className="text-xs text-gray-500">{card.due_date ? formatDueDate(card.due_date) : '-'}</div>
            </div>
            <TruncatedInlineEdit
              value={card.description || ''}
              onSave={(newDesc) => handleUpdateCard(card.id, { description: newDesc })}
              disabled={!canEdit}
              maxLength={200}
              className="mt-2 text-sm text-gray-600 break-words"
              placeholder="Agregar descripción..."
            />
            <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
              <div>{computePriorityForCard(card).text || '-'}</div>
              <div>{(boardUsers as Array<{id:number;name:string}>).find(u => u.id === card.assigned_user_id)?.name || '-'}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop/table view with drag-and-drop */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="hidden sm:block bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="w-full">
            <table className="min-w-[900px] w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-2 py-3 w-8"></th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tarjeta</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Prioridad</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lista</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha límite</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Asignado</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <Droppable droppableId="table-cards">
                {(provided) => (
                  <tbody className="bg-white divide-y divide-gray-200" {...provided.droppableProps} ref={provided.innerRef}>
                    {(() => {
                      const rows: React.ReactNode[] = [];
                      let draggableIndex = 0;
                      let lastListId: number | null = null;

                      optimisticCards.forEach((card: ExtendedCard) => {
                        // Si cambiamos de lista, insertar un header row
                        if (lastListId !== card.listId) {
                          rows.push(
                            <tr key={`header-${card.listId}`} className="bg-gray-100">
                              <td colSpan={7} className="px-4 py-2 text-sm font-semibold text-gray-700">{card.listName}</td>
                            </tr>
                          );
                          lastListId = card.listId;
                        }

                        rows.push(
                          <Draggable key={card.id} draggableId={card.id.toString()} index={draggableIndex}>
                            {(prov, snapshot) => (
                              <tr
                                ref={prov.innerRef}
                                {...prov.draggableProps}
                                className={`hover:bg-gray-50 ${snapshot.isDragging ? 'bg-kodigo-light/20' : ''}`}
                              >
                                <td className="px-2 py-4">
                                  <div {...prov.dragHandleProps} className="cursor-grab hover:cursor-grabbing text-gray-400 hover:text-kodigo-primary">
                                    <GripVertical size={16} />
                                  </div>
                                </td>

                                <td className="px-4 py-4 align-top">
                                  <InlineEdit
                                    value={card.title}
                                    onSave={(newTitle) => handleUpdateCard(card.id, { title: newTitle })}
                                    disabled={!canEdit}
                                    className="text-sm font-medium text-gray-900"
                                    placeholder="Sin título"
                                  />
                                  <TruncatedInlineEdit
                                    value={card.description || ''}
                                    onSave={(newDesc) => handleUpdateCard(card.id, { description: newDesc })}
                                    disabled={!canEdit}
                                    maxLength={75}
                                    className="text-sm text-gray-500"
                                    placeholder="Agregar descripción..."
                                  />
                                </td>

                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {/* Priority chip with select to change priority */}
                                  {(() => {
                                    const p = computePriorityForCard(card);
                                    // Determine current priority string ('' | baja | media | alta | extremo)
                                    const currentPriority = (() => {
                                      const labelIds = ((card as unknown) as { label_ids?: number[] }).label_ids;
                                      if (labelIds && labelIds.length > 0 && globalLabels.length > 0) {
                                        return getPriorityFromLabelId(labelIds[0]);
                                      }
                                      // fallback to derived priority from card.labels
                                      const derived = getPriorityFromLabels(card.labels).priority as 'baja' | 'media' | 'alta' | null;
                                      return derived ?? '';
                                    })();

                                    // Determine CSS classes based on controlled currentPriority so visuals update immediately
                                    const priorityClass = currentPriority === 'alta'
                                      ? 'bg-red-100 text-red-600'
                                      : currentPriority === 'media'
                                      ? 'bg-yellow-100 text-yellow-600'
                                      : currentPriority === 'baja'
                                      ? 'bg-green-100 text-green-600'
                                      : 'bg-gray-100 text-gray-500';

                                    const displayText = p.text || (currentPriority === 'alta' ? 'Alta' : currentPriority === 'media' ? 'Media' : currentPriority === 'baja' ? 'Baja' : '-');

                                    return (
                                      <div className="inline-block">
                                        {canEdit ? (
                                          <select
                                            value={(() => {
                                              const labelIds = ((card as unknown) as { label_ids?: number[] }).label_ids;
                                              if (labelIds && labelIds.length > 0) return labelIds[0];
                                              if (card.labels && card.labels.length > 0) return card.labels[0].id;
                                              return '';
                                            })()}
                                            onChange={async (e) => {
                                              const selected = e.target.value === '' ? null : parseInt(e.target.value, 10);

                                              // Build payload and optimistic label_ids
                                              const payload: Partial<UpdateCardRequest> = {};
                                              let optimisticLabelIds: number[] = [];
                                              if (selected === null) {
                                                payload.label_ids = [];
                                                optimisticLabelIds = [];
                                              } else {
                                                payload.label_ids = [selected];
                                                optimisticLabelIds = [selected];
                                              }

                                              // Optimistic update: hydrate labels from globalLabels
                                              const optimisticLabelObjs: Label[] = optimisticLabelIds.map(id => {
                                                const g = globalLabels.find(l => l.id === id);
                                                if (g) {
                                                  return {
                                                    id: g.id,
                                                    name: g.name || '',
                                                    color: g.color || '#000000',
                                                    board_id: g.board_id ?? null,
                                                    created_at: g.created_at ?? new Date().toISOString(),
                                                    updated_at: g.updated_at ?? new Date().toISOString(),
                                                    priority: g.priority
                                                  } as Label;
                                                }
                                                return {
                                                  id,
                                                  name: '',
                                                  color: '#000000',
                                                  board_id: board.id,
                                                  created_at: new Date().toISOString(),
                                                  updated_at: new Date().toISOString(),
                                                } as Label;
                                              });

                                              setOptimisticCards(prev => prev.map(c => c.id === card.id ? ({ ...c, label_ids: optimisticLabelIds, labels: optimisticLabelObjs }) as ExtendedCard : c));

                                              startSync(`update-card-priority-${card.id}`);
                                              try {
                                                const updated = await cardService.updateCard(card.id, payload as UpdateCardRequest);
                                                // If server didn't return labels, but returned label_ids, hydrate labels from globalLabels
                                                type PartialCard = Partial<ExtendedCard> & { label_ids?: number[] };
                                                let hydrated: PartialCard = { ...updated } as PartialCard;
                                                const returnedLabelIds = (updated as PartialCard).label_ids;
                                                if ((!(hydrated.labels && hydrated.labels.length > 0)) && returnedLabelIds && returnedLabelIds.length > 0) {
                                                  type GL = { id: number; name?: string; color?: string; priority?: string; board_id?: number | null; created_at?: string; updated_at?: string };
                                                  const resolved = returnedLabelIds
                                                    .map(id => globalLabels.find(gl => gl.id === id) as GL | undefined)
                                                    .filter(Boolean)
                                                    .map(l => ({
                                                      id: l!.id,
                                                      name: l!.name || '',
                                                      color: l!.color || '#6B7280',
                                                      board_id: l!.board_id ?? null,
                                                      created_at: l!.created_at ?? new Date().toISOString(),
                                                      updated_at: l!.updated_at ?? new Date().toISOString(),
                                                      priority: l!.priority
                                                    } as Label));
                                                  hydrated = { ...hydrated, labels: resolved };
                                                }

                                                // If optimistic label objects were set previously, prefer server-hydrated labels
                                                setOptimisticCards(prev => prev.map(c => c.id === updated.id ? ({ ...c, ...hydrated, listId: updated.board_list_id ?? c.listId }) as ExtendedCard : c));
                                                showNotification('success', 'Prioridad actualizada');
                                                  // Refresh board data so other views (Kanban, modals) receive updated card state
                                                  setTimeout(() => {
                                                    onBoardUpdate();
                                                  }, 300);
                                              } catch (err) {
                                                console.error('Error updating priority', err);
                                                showNotification('error', 'Error al actualizar prioridad');
                                                // Revert optimistic change on error
                                                revertOptimisticChanges();
                                              } finally {
                                                endSync(`update-card-priority-${card.id}`);
                                              }
                                            }}
                                            className={clsx('px-2 py-0.5 rounded-full text-xs font-medium border', priorityClass)}
                                          >
                                            <option value="">-</option>
                                            {globalLabels.filter(l => /alta|alto|media|medio|baja|bajo|extremo|urgent|critical|high|medium|low/i.test(l.name)).map(l => (
                                              <option key={l.id} value={l.id}>{l.name}</option>
                                            ))}
                                          </select>
                                        ) : (
                                          <button className={clsx('px-2 py-0.5 rounded-full text-xs font-medium', priorityClass)}>
                                            {displayText}
                                          </button>
                                        )}
                                      </div>
                                    );
                                  })()}
                                </td>

                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {/* Show list name as a non-editable label in table view */}
                                  <span>{card.listName}</span>
                                </td>

                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{card.due_date ? formatDueDate(card.due_date) : '-'}</td>

                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{(boardUsers as Array<{id:number;name:string}>).find(u => u.id === card.assigned_user_id)?.name || '-'}</td>

                                <td className="px-4 py-4 whitespace-nowrap text-sm">
                                  <button onClick={() => onCardClick(card)} className="text-kodigo-primary hover:text-kodigo-dark font-medium">Ver detalles</button>
                                </td>
                              </tr>
                            )}
                          </Draggable>
                        );

                        draggableIndex += 1;
                      });

                      // provided.placeholder se debe renderizar al final dentro del tbody
                      // Clonar el placeholder con una key estable para evitar warnings de React
                      const placeholderElement = React.isValidElement(provided.placeholder)
                        ? React.cloneElement(provided.placeholder as React.ReactElement, { key: 'dnd-placeholder' })
                        : provided.placeholder;
                      rows.push(placeholderElement);

                      return rows;
                    })()}
                  </tbody>
                )}
              </Droppable>
            </table>
          </div>
        </div>
      </DragDropContext>

      {optimisticCards.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No hay tarjetas en este tablero</p>
        </div>
      )}
    </div>
  );
};