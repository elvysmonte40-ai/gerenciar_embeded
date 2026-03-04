import React, { useCallback, useState } from "react";
import * as XLSX from "xlsx";

interface DataUploaderProps {
    onDataLoaded: (data: any[]) => void;
    expectedColumns?: string[]; // Optional: basic validation
}

export function DataUploader({ onDataLoaded, expectedColumns }: DataUploaderProps) {
    const [isDragging, setIsDragging] = useState(false);
    const [fileName, setFileName] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const processFile = (file: File) => {
        setFileName(file.name);
        setError(null);

        const reader = new FileReader();

        reader.onload = (e) => {
            try {
                const data = new Uint8Array(e.target?.result as ArrayBuffer);
                const workbook = XLSX.read(data, { type: "array" });

                // Read first sheet
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];

                // Convert to JSON (array of objects)
                const json = XLSX.utils.sheet_to_json(worksheet, { defval: "" });

                if (json.length === 0) {
                    setError("O arquivo selecionado está vazio.");
                    return;
                }

                // Check basic column structure if requested
                if (expectedColumns && expectedColumns.length > 0) {
                    const firstRow = json[0] as Record<string, any>;
                    const foundColumns = Object.keys(firstRow);
                    const missing = expectedColumns.filter(c => !foundColumns.includes(c));
                    if (missing.length > 0) {
                        setError(`Faltam colunas obrigatórias: ${missing.join(", ")}`);
                        return;
                    }
                }

                onDataLoaded(json);
            } catch (err: any) {
                console.error("Erro ao ler planilha:", err);
                const msg = err.message || "Erro desconhecido";
                setError(`Falha ao ler o arquivo: ${msg} (Verifique as colunas e o formato)`);
            }
        };

        reader.onerror = () => {
            setError("Falha ao ler o arquivo localmente.");
        };

        reader.readAsArrayBuffer(file);
    };

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            processFile(e.dataTransfer.files[0]);
        }
    }, [expectedColumns]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            processFile(e.target.files[0]);
        }
    };

    return (
        <div className="w-full">
            <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`w-full flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-lg transition-colors ${isDragging ? "border-brand bg-brand-light/10" : "border-gray-300 bg-white"
                    }`}
            >
                <div className="space-y-1 text-center">
                    <svg
                        className="mx-auto h-12 w-12 text-gray-400"
                        stroke="currentColor"
                        fill="none"
                        viewBox="0 0 48 48"
                        aria-hidden="true"
                    >
                        <path
                            d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4-4m4-24h8m-4-4v8m-12 4h.02"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    </svg>
                    <div className="flex text-sm text-text-secondary justify-center">
                        <label
                            htmlFor="file-upload"
                            className="relative cursor-pointer rounded-md bg-white font-medium text-brand focus-within:outline-none focus-within:ring-2 focus-within:ring-brand focus-within:ring-offset-2 hover:text-brand-dark"
                        >
                            <span>Selecione um arquivo</span>
                            <input
                                id="file-upload"
                                name="file-upload"
                                type="file"
                                className="sr-only"
                                accept=".xlsx, .xls, .csv"
                                onChange={handleFileChange}
                            />
                        </label>
                        <p className="pl-1">ou arraste e solte</p>
                    </div>
                    <p className="text-xs text-text-tertiary">
                        Arquivos suportados: XLSX, XLS, CSV formatado (&lt; 10MB)
                    </p>
                </div>
            </div>

            {fileName && !error && (
                <div className="mt-2 text-sm text-green-600 flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                    Arquivo carregado: <span className="font-semibold ml-1">{fileName}</span>
                </div>
            )}

            {error && (
                <div className="mt-2 text-sm text-red-600 flex items-center bg-red-50 p-2 rounded">
                    <svg className="w-4 h-4 mr-1 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    <span>{error}</span>
                </div>
            )}
        </div>
    );
}
