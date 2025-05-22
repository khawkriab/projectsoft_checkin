import { TableRow, TableRowProps } from '@mui/material';

export function TableHeadRow({ children, ...props }: { children: React.ReactNode } & TableRowProps) {
    return (
        <TableRow
            sx={(theme) => ({
                backgroundColor: theme.palette.primary.main,
            })}
            {...props}
        >
            {children}
        </TableRow>
    );
}
