import React from 'react';

const Table = ({ className, children, ...props }) => (
    <div className="w-full overflow-auto rounded-lg border border-slate-200 shadow-sm">
        <table className={`w-full caption-bottom text-sm ${className}`} {...props}>
            {children}
        </table>
    </div>
);

const TableHeader = ({ className, children, ...props }) => (
    <thead className={`[&_tr]:border-b bg-slate-50 ${className}`} {...props}>
        {children}
    </thead>
);

const TableBody = ({ className, children, ...props }) => (
    <tbody className={`[&_tr:last-child]:border-0 ${className}`} {...props}>
        {children}
    </tbody>
);

const TableRow = ({ className, children, ...props }) => (
    <tr className={`border-b transition-colors hover:bg-slate-50/50 data-[state=selected]:bg-slate-50 ${className}`} {...props}>
        {children}
    </tr>
);

const TableHead = ({ className, children, ...props }) => (
    <th className={`h-12 px-4 text-left align-middle font-medium text-slate-500 [&:has([role=checkbox])]:pr-0 ${className}`} {...props}>
        {children}
    </th>
);

const TableCell = ({ className, children, ...props }) => (
    <td className={`p-4 align-middle [&:has([role=checkbox])]:pr-0 ${className}`} {...props}>
        {children}
    </td>
);

const TableEmpty = ({ colSpan, message = "Tidak ada data tersedia." }) => (
    <TableRow>
        <TableCell colSpan={colSpan} className="h-24 text-center text-slate-500">
            {message}
        </TableCell>
    </TableRow>
);

export { Table, TableHeader, TableBody, TableRow, TableHead, TableCell, TableEmpty };
