'use client'

import { useState } from 'react';
import { testFirestoreEmulator, getServerTestDocuments } from '@/app/actions/test-emulator';
import { Button } from '@/app/components/ui/button';
import { Text } from '@/app/components/ui/text';

/**
 * Component to test server-side Firebase emulator functionality
 * Only shows in development mode
 */
export function ServerEmulatorTest() {
  const [result, setResult] = useState<any>(null);
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Don't render in production
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  const handleServerTest = async () => {
    try {
      setLoading(true);
      setResult(null);
      
      const response = await testFirestoreEmulator();
      setResult(response);
      
      if (response.success) {
        // Also refresh the document list
        await handleGetDocuments();
      }
    } catch (error) {
      setResult({
        success: false,
        message: `Client error: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGetDocuments = async () => {
    try {
      setLoading(true);
      
      const response = await getServerTestDocuments();
      setDocuments(response.documents || []);
      
      if (!response.success) {
        setResult(response);
      }
    } catch (error) {
      setResult({
        success: false,
        message: `Client error getting documents: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
      <Text className="text-lg font-semibold text-blue-800 mb-3">🖥️ Server-Side Emulator Test</Text>
      
      <div className="space-x-2 mb-4">
        <Button onClick={handleServerTest} disabled={loading} plain>
          {loading ? 'Testing...' : 'Test Server Action'}
        </Button>
        <Button onClick={handleGetDocuments} disabled={loading} plain>
          Get Server Documents
        </Button>
      </div>

      {/* Result Display */}
      {result && (
        <div className={`mb-4 p-3 rounded ${result.success ? 'bg-green-100 border border-green-200' : 'bg-red-100 border border-red-200'}`}>
          <Text className={`text-sm ${result.success ? 'text-green-800' : 'text-red-800'}`}>
            {result.success ? '✅' : '❌'} {result.message}
          </Text>
          {result.emulatorUsed !== undefined && (
            <Text className="text-xs text-gray-600 mt-1">
              Emulator Used: {result.emulatorUsed ? 'Yes' : 'No'}
            </Text>
          )}
          {result.data && (
            <details className="mt-2">
              <summary className="text-xs cursor-pointer">Show Data</summary>
              <pre className="text-xs bg-white p-2 rounded mt-1 overflow-auto">
                {JSON.stringify(result.data, null, 2)}
              </pre>
            </details>
          )}
        </div>
      )}

      {/* Documents Display */}
      {documents.length > 0 && (
        <div>
          <Text className="text-sm font-medium text-gray-700 mb-2">
            Server Test Documents ({documents.length}):
          </Text>
          <div className="bg-white rounded border p-2 max-h-40 overflow-y-auto">
            {documents.map((doc, index) => (
              <div key={doc.id} className="text-xs mb-2 p-2 bg-gray-50 rounded">
                <Text className="font-mono">#{index + 1} ({doc.id})</Text>
                <Text>{doc.message}</Text>
                <Text className="text-gray-500">
                  {doc.timestamp} | Random: {doc.randomValue}
                </Text>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-3 pt-3 border-t border-blue-200">
        <Text className="text-xs text-blue-700">
          💡 This tests server actions and Firebase Admin SDK with emulators.
        </Text>
      </div>
    </div>
  );
}