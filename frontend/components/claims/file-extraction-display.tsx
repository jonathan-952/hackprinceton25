'use client'

import { FileText, CheckCircle, Sparkles, Download } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

interface ExtractedData {
  field: string
  value: string
  confidence: number
}

interface FileExtractionDisplayProps {
  files?: Array<{
    name: string
    size: number
    uploadedAt: string
  }>
  extractedData?: ExtractedData[]
  processingStatus?: 'idle' | 'processing' | 'complete' | 'error'
}

export function FileExtractionDisplay({
  files = [],
  extractedData = [],
  processingStatus = 'idle'
}: FileExtractionDisplayProps) {
  return (
    <div className="space-y-4">
      {/* Uploaded Files Section */}
      {files.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold text-sm text-gray-700">Uploaded Documents</h4>
              <Badge variant="secondary">{files.length} file{files.length !== 1 ? 's' : ''}</Badge>
            </div>
            <div className="space-y-2">
              {files.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                      <FileText className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{file.name}</p>
                      <p className="text-xs text-gray-500">
                        {(file.size / 1024 / 1024).toFixed(2)} MB • {file.uploadedAt}
                      </p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* AI Extraction Results */}
      {extractedData.length > 0 && (
        <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="h-5 w-5 text-purple-600" />
              <h4 className="font-bold text-sm text-purple-900">AI-Extracted Data</h4>
              {processingStatus === 'complete' && (
                <Badge variant="success" className="ml-auto">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Verified
                </Badge>
              )}
              {processingStatus === 'processing' && (
                <Badge variant="default" className="ml-auto animate-pulse">
                  Processing...
                </Badge>
              )}
            </div>

            <div className="space-y-3">
              {extractedData.map((item, index) => (
                <div
                  key={index}
                  className="bg-white rounded-lg p-3 border border-purple-200"
                >
                  <div className="flex-1">
                    <p className="text-xs font-medium text-gray-500 uppercase mb-1">
                      {item.field}
                    </p>
                    <p className="text-sm font-semibold text-gray-900">{item.value}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 p-3 bg-purple-100 rounded-lg">
              <p className="text-xs text-purple-800">
                <strong>AI Extracted:</strong> Our AI extracted {extractedData.length} key data points
                from your documents. All data has been verified and is ready for submission.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {files.length === 0 && extractedData.length === 0 && (
        <Card className="border-dashed border-2">
          <CardContent className="p-8 text-center">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <p className="text-sm text-gray-600">No documents uploaded yet</p>
            <p className="text-xs text-gray-500 mt-1">
              Upload documents to see AI extraction in action
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
