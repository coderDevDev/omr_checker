'use client';

import React, { useState, useMemo } from 'react';
import {
  Download,
  Eye,
  AlertTriangle,
  CheckCircle,
  XCircle,
  BarChart3,
  FileText
} from 'lucide-react';

interface ResultsDisplayProps {
  results: any[];
}

// Utility function to sort question keys
const sortQuestionKeys = (keys: string[]): string[] => {
  return keys.sort((a, b) => {
    // Extract numbers from various formats: Q1, Question1, 1, etc.
    const numA = parseInt(a.replace(/\D/g, '')) || 0;
    const numB = parseInt(b.replace(/\D/g, '')) || 0;

    if (numA !== numB) {
      return numA - numB;
    }

    // If numbers are equal, sort alphabetically
    return a.localeCompare(b);
  });
};

// Utility function to organize responses by columns
const organizeResponsesByColumns = (responses: Record<string, string>) => {
  const columns: Record<string, Array<{ key: string; value: string }>> = {};

  Object.entries(responses).forEach(([key, value]) => {
    const questionNum = parseInt(key.replace(/\D/g, '')) || 0;

    // Determine which column this question belongs to
    let columnName = '';
    if (questionNum >= 1 && questionNum <= 20) {
      columnName = 'Column1 (Q1-Q20)';
    } else if (questionNum >= 21 && questionNum <= 40) {
      columnName = 'Column2 (Q21-Q40)';
    } else if (questionNum >= 41 && questionNum <= 60) {
      columnName = 'Column3 (Q41-Q60)';
    } else if (questionNum >= 61 && questionNum <= 80) {
      columnName = 'Column4 (Q61-Q80)';
    } else if (questionNum >= 81 && questionNum <= 100) {
      columnName = 'Column5 (Q81-Q100)';
    } else {
      columnName = 'Other Questions';
    }

    if (!columns[columnName]) {
      columns[columnName] = [];
    }

    columns[columnName].push({ key, value });
  });

  // Sort questions within each column
  Object.keys(columns).forEach(columnName => {
    columns[columnName].sort((a, b) => {
      const numA = parseInt(a.key.replace(/\D/g, '')) || 0;
      const numB = parseInt(b.key.replace(/\D/g, '')) || 0;
      return numA - numB;
    });
  });

  return columns;
};

const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ results }) => {
  const [selectedResult, setSelectedResult] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  const processedResults = useMemo(() => {
    return results.map((result, index) => {
      // Sort responses by question number (Q1, Q2, Q3, etc.)
      const sortedKeys = sortQuestionKeys(Object.keys(result.responses || {}));
      const sortedResponses = sortedKeys.reduce((sorted, key) => {
        sorted[key] = result.responses[key];
        return sorted;
      }, {} as Record<string, string>);

      return {
        ...result,
        id: index,
        filename: result.filename || `OMR_${index + 1}`,
        success: !result.error,
        responses: sortedResponses,
        multiMarked: result.multi_marked || false,
        multiRoll: result.multi_roll || false
      };
    });
  }, [results]);

  const exportToCSV = () => {
    if (!processedResults.length) return;

    // Get sorted headers from the first result
    const sortedHeaders = Object.keys(processedResults[0].responses);

    const headers = [
      'Filename',
      'Status',
      'Multi-Marked',
      'Multi-Roll',
      ...sortedHeaders
    ];
    const csvContent = [
      headers.join(','),
      ...processedResults.map(result =>
        [
          result.filename,
          result.success ? 'Success' : 'Error',
          result.multiMarked ? 'Yes' : 'No',
          result.multiRoll ? 'Yes' : 'No',
          ...sortedHeaders.map(header => result.responses[header] || '-')
        ].join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `omr_results_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const getStatusIcon = (result: any) => {
    if (!result.success) {
      return <XCircle className="h-5 w-5 text-red-500" />;
    }
    if (result.multiMarked) {
      return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
    }
    return <CheckCircle className="h-5 w-5 text-green-500" />;
  };

  const getStatusText = (result: any) => {
    if (!result.success) {
      return 'Error';
    }
    if (result.multiMarked) {
      return 'Multi-Marked';
    }
    return 'Success';
  };

  const getStatusColor = (result: any) => {
    if (!result.success) {
      return 'text-red-600 bg-red-50 border-red-200';
    }
    if (result.multiMarked) {
      return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    }
    return 'text-green-600 bg-green-50 border-green-200';
  };

  const stats = useMemo(() => {
    const total = processedResults.length;
    const successful = processedResults.filter(
      r => r.success && !r.multiMarked
    ).length;
    const multiMarked = processedResults.filter(r => r.multiMarked).length;
    const errors = processedResults.filter(r => !r.success).length;
    const accuracy = total > 0 ? Math.round((successful / total) * 100) : 0;

    return { total, successful, multiMarked, errors, accuracy };
  }, [processedResults]);

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
      {/* Header with gradient background */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 px-6 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="bg-white/20 backdrop-blur-sm p-3 rounded-xl">
              <BarChart3 className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">
                Processing Results
              </h2>
              <p className="text-blue-100 text-sm">
                {stats.total} OMR sheets processed
              </p>
            </div>
          </div>
          <button
            onClick={exportToCSV}
            className="bg-white text-blue-600 hover:bg-blue-50 px-6 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
            <Download className="h-5 w-5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>
      {/* Summary Stats - Mobile First */}
      <div className="p-6">
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          {/* Total Processed */}
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-2xl border border-blue-200 shadow-sm hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-blue-500 rounded-lg">
                <BarChart3 className="h-5 w-5 text-white" />
              </div>
              <div className="text-3xl font-bold text-blue-600">
                {stats.total}
              </div>
            </div>
            <div className="text-sm font-medium text-blue-700">
              Total Processed
            </div>
          </div>

          {/* Successful */}
          <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-2xl border border-green-200 shadow-sm hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-green-500 rounded-lg">
                <CheckCircle className="h-5 w-5 text-white" />
              </div>
              <div className="text-3xl font-bold text-green-600">
                {stats.successful}
              </div>
            </div>
            <div className="text-sm font-medium text-green-700">Successful</div>
          </div>

          {/* Multi-Marked */}
          <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-6 rounded-2xl border border-yellow-200 shadow-sm hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-yellow-500 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-white" />
              </div>
              <div className="text-3xl font-bold text-yellow-600">
                {stats.multiMarked}
              </div>
            </div>
            <div className="text-sm font-medium text-yellow-700">
              Multi-Marked
            </div>
          </div>

          {/* Errors */}
          <div className="bg-gradient-to-br from-red-50 to-red-100 p-6 rounded-2xl border border-red-200 shadow-sm hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-red-500 rounded-lg">
                <XCircle className="h-5 w-5 text-white" />
              </div>
              <div className="text-3xl font-bold text-red-600">
                {stats.errors}
              </div>
            </div>
            <div className="text-sm font-medium text-red-700">Errors</div>
          </div>

          {/* Accuracy */}
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-2xl border border-purple-200 shadow-sm hover:shadow-md transition-shadow duration-200 col-span-2 lg:col-span-1">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-purple-500 rounded-lg">
                <BarChart3 className="h-5 w-5 text-white" />
              </div>
              <div className="text-3xl font-bold text-purple-600">
                {stats.accuracy}%
              </div>
            </div>
            <div className="text-sm font-medium text-purple-700">
              Accuracy Rate
            </div>
          </div>
        </div>
        {/* Results Table - Mobile First Design */}
        <div className="bg-gray-50 rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <FileText className="h-5 w-5 mr-2 text-gray-600" />
            Individual Results
          </h3>

          {/* Mobile Cards Layout */}
          <div className="block lg:hidden space-y-4">
            {processedResults.map(result => (
              <div
                key={result.id}
                className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(result)}
                    <div>
                      <h4 className="font-semibold text-gray-900 text-sm">
                        {result.filename}
                      </h4>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(
                          result
                        )}`}>
                        {getStatusText(result)}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedResult(result);
                      setShowDetails(true);
                    }}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
                    View Details
                  </button>
                </div>

                {result.success && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-700">
                      Responses (by Column):
                    </p>
                    {(() => {
                      const organizedColumns = organizeResponsesByColumns(
                        result.responses
                      );
                      return (
                        <div className="space-y-2">
                          {Object.entries(organizedColumns)
                            .slice(0, 2)
                            .map(([columnName, questions]) => (
                              <div
                                key={columnName}
                                className="bg-gray-50 rounded-lg p-2">
                                <div className="text-xs font-medium text-gray-600 mb-1">
                                  {columnName}
                                </div>
                                <div className="flex flex-wrap gap-1">
                                  {questions
                                    .slice(0, 4)
                                    .map(({ key, value }) => (
                                      <span
                                        key={key}
                                        className="bg-white px-2 py-1 rounded text-xs font-mono border">
                                        {key}: {value}
                                      </span>
                                    ))}
                                  {questions.length > 4 && (
                                    <span className="text-xs text-gray-500 bg-blue-50 px-2 py-1 rounded">
                                      +{questions.length - 4}
                                    </span>
                                  )}
                                </div>
                              </div>
                            ))}
                          {Object.keys(organizedColumns).length > 2 && (
                            <span className="text-xs text-gray-500 bg-blue-50 px-3 py-1 rounded-full">
                              +{Object.keys(organizedColumns).length - 2} more
                              columns
                            </span>
                          )}
                        </div>
                      );
                    })()}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Desktop Table Layout */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    File
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Responses
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {processedResults.map(result => (
                  <tr
                    key={result.id}
                    className="hover:bg-gray-50 transition-colors duration-150">
                    <td className="px-6 py-6 whitespace-nowrap">
                      <div className="flex items-center space-x-4">
                        <div className="flex-shrink-0">
                          {getStatusIcon(result)}
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-gray-900">
                            {result.filename}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-6 whitespace-nowrap">
                      <div className="space-y-1">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(
                            result
                          )}`}>
                          {getStatusText(result)}
                        </span>
                        {result.multiMarked && (
                          <div className="text-xs text-yellow-600 font-medium">
                            Multiple bubbles marked
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-6">
                      <div className="text-sm text-gray-900">
                        {result.success ? (
                          <div className="space-y-2">
                            {(() => {
                              const organizedColumns =
                                organizeResponsesByColumns(result.responses);
                              return Object.entries(organizedColumns)
                                .slice(0, 2)
                                .map(([columnName, questions]) => (
                                  <div
                                    key={columnName}
                                    className="bg-gray-50 rounded-lg p-2">
                                    <div className="text-xs font-medium text-gray-600 mb-1">
                                      {columnName}
                                    </div>
                                    <div className="flex flex-wrap gap-1">
                                      {questions
                                        .slice(0, 3)
                                        .map(({ key, value }) => (
                                          <span
                                            key={key}
                                            className="bg-white px-2 py-1 rounded text-xs font-mono border">
                                            {key}: {value}
                                          </span>
                                        ))}
                                      {questions.length > 3 && (
                                        <span className="text-xs text-gray-500 bg-blue-50 px-2 py-1 rounded">
                                          +{questions.length - 3}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                ));
                            })()}
                            {(() => {
                              const organizedColumns =
                                organizeResponsesByColumns(result.responses);
                              if (Object.keys(organizedColumns).length > 2) {
                                return (
                                  <span className="text-xs text-gray-500 bg-blue-50 px-3 py-1 rounded-full font-medium">
                                    +{Object.keys(organizedColumns).length - 2}{' '}
                                    more columns
                                  </span>
                                );
                              }
                              return null;
                            })()}
                          </div>
                        ) : (
                          <span className="text-red-600 text-sm font-medium bg-red-50 px-3 py-1 rounded-full">
                            {result.error}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-6 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => {
                          setSelectedResult(result);
                          setShowDetails(true);
                        }}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium">
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Detailed View Modal - Mobile First */}
          {showDetails && selectedResult && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
                {/* Modal Header */}
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="bg-white/20 backdrop-blur-sm p-2 rounded-lg">
                        <FileText className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-white">
                          Detailed Results
                        </h3>
                        <p className="text-blue-100 text-sm">
                          {selectedResult.filename}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setShowDetails(false)}
                      className="bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 p-2 rounded-lg transition-colors">
                      <XCircle className="h-6 w-6" />
                    </button>
                  </div>
                </div>

                <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
                  <div className="space-y-6">
                    {/* Status Information */}
                    <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-6 rounded-xl border border-gray-200">
                      <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                        <CheckCircle className="h-5 w-5 mr-2 text-gray-600" />
                        Processing Status
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="bg-white p-4 rounded-lg shadow-sm">
                          <span className="text-sm text-gray-600 block mb-1">
                            Status:
                          </span>
                          <span
                            className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold border ${getStatusColor(
                              selectedResult
                            )}`}>
                            {getStatusText(selectedResult)}
                          </span>
                        </div>
                        <div className="bg-white p-4 rounded-lg shadow-sm">
                          <span className="text-sm text-gray-600 block mb-1">
                            Multi-Marked:
                          </span>
                          <span className="font-semibold text-gray-900">
                            {selectedResult.multiMarked ? 'Yes' : 'No'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Responses */}
                    {selectedResult.success && (
                      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-200">
                        <h4 className="font-semibold text-gray-900 mb-6 flex items-center">
                          <BarChart3 className="h-5 w-5 mr-2 text-blue-600" />
                          Detected Responses
                          <span className="ml-3 text-xs bg-blue-600 text-white px-3 py-1 rounded-full font-medium">
                            Organized by Columns •{' '}
                            {Object.keys(selectedResult.responses).length} Total
                          </span>
                        </h4>

                        {(() => {
                          const organizedColumns = organizeResponsesByColumns(
                            selectedResult.responses
                          );
                          return (
                            <div className="space-y-6">
                              {Object.entries(organizedColumns).map(
                                ([columnName, questions]) => (
                                  <div
                                    key={columnName}
                                    className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                                    <h5 className="font-semibold text-gray-800 mb-3 text-sm uppercase tracking-wide flex items-center">
                                      <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                                      {columnName}
                                      <span className="ml-2 text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                                        {questions.length} questions
                                      </span>
                                    </h5>
                                    <div className="grid grid-cols-4 sm:grid-cols-5 lg:grid-cols-10 gap-2">
                                      {questions.map(({ key, value }) => (
                                        <div
                                          key={key}
                                          className="bg-gray-50 p-3 rounded-lg border border-gray-200 hover:bg-blue-50 hover:border-blue-300 transition-colors duration-200">
                                          <div className="text-xs text-gray-500 font-medium mb-1 text-center">
                                            {key}
                                          </div>
                                          <div className="font-bold text-gray-900 text-center text-lg">
                                            {value}
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )
                              )}
                            </div>
                          );
                        })()}
                      </div>
                    )}

                    {/* Error Information */}
                    {!selectedResult.success && (
                      <div className="bg-gradient-to-r from-red-50 to-red-100 p-6 rounded-xl border border-red-200">
                        <h4 className="font-semibold text-red-800 mb-3 flex items-center">
                          <XCircle className="h-5 w-5 mr-2 text-red-600" />
                          Error Details
                        </h4>
                        <div className="bg-white p-4 rounded-lg shadow-sm">
                          <p className="text-red-700 font-medium">
                            {selectedResult.error}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>{' '}
      </div>{' '}
    </div>
  );
};

export default ResultsDisplay;
