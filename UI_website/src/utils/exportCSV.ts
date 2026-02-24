// CSV Export Utility — No dependencies required

/**
 * Convert an array of objects to CSV and trigger download
 */
export function exportToCSV(data: any[], filename: string): void {
    if (!data || data.length === 0) {
        alert('No data to export');
        return;
    }

    // Get headers from the first row
    const headers = Object.keys(data[0]);

    // Build CSV rows
    const csvRows = [
        headers.join(','), // Header row
        ...data.map(row =>
            headers.map(h => {
                const val = row[h];
                // Escape commas and quotes in values
                const escaped = String(val ?? '').replace(/"/g, '""');
                return `"${escaped}"`;
            }).join(',')
        )
    ];

    // Create blob and download
    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}
