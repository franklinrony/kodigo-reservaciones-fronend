import React from 'react';
import { Board, Card } from '../../models';
import { Calendar, MessageCircle, User } from 'lucide-react';
import { format } from 'date-fns';

interface TableViewProps {
  board: Board;
  onCardClick: (card: Card) => void;
}

export const TableView: React.FC<TableViewProps> = ({ board, onCardClick }) => {
  const allCards = board.lists?.flatMap(list => 
    list.cards?.map(card => ({ ...card, listName: list.name })) || []
  ) || [];

  return (
    <div className="p-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tarjeta
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Lista
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Etiquetas
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Fecha de vencimiento
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Comentarios
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Asignado
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Estado
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {allCards.map((card: any) => (
              <tr
                key={card.id}
                className="hover:bg-gray-50 cursor-pointer"
                onClick={() => onCardClick(card)}
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900">{card.title}</div>
                    {card.description && (
                      <div className="text-sm text-gray-500 truncate max-w-xs">
                        {card.description}
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                    {card.listName}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex flex-wrap gap-1">
                    {card.labels?.map((label: any) => (
                      <span
                        key={label.id}
                        className="px-2 py-1 text-xs font-medium rounded"
                        style={{
                          backgroundColor: label.color + '20',
                          color: label.color
                        }}
                      >
                        {label.name}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {card.due_date ? (
                    <div className="flex items-center space-x-1">
                      <Calendar size={14} />
                      <span>{format(new Date(card.due_date), 'dd/MM/yyyy')}</span>
                    </div>
                  ) : (
                    '-'
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {card.comments?.length > 0 ? (
                    <div className="flex items-center space-x-1">
                      <MessageCircle size={14} />
                      <span>{card.comments.length}</span>
                    </div>
                  ) : (
                    '-'
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {card.user ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                        <User size={12} className="text-white" />
                      </div>
                      <span className="text-sm text-gray-900">{card.user.name}</span>
                    </div>
                  ) : (
                    '-'
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    card.is_completed 
                      ? 'bg-green-100 text-green-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {card.is_completed ? 'Completada' : 'Pendiente'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {allCards.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No hay tarjetas en este tablero</p>
          </div>
        )}
      </div>
    </div>
  );
};