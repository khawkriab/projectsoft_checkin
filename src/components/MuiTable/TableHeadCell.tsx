import { TableCell, TableCellProps } from '@mui/material';

export function TableHeadCell({ children, ...props }: { children: React.ReactNode } & TableCellProps) {
    return (
        <TableCell
            {...props}
            sx={[
                (theme) => ({
                    color: theme.palette.primary.contrastText,
                    fontWeight: 600,
                    whiteSpace: 'nowrap',
                    borderBottomColor: theme.palette.primary.contrastText,
                }),
                (theme) => ({ ...(typeof props?.sx === 'function' ? props.sx(theme) : props.sx) }),
            ]}
        >
            {children}
        </TableCell>
    );
}
