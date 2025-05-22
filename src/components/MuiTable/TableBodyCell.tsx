import { TableCell, TableCellProps } from '@mui/material';

export function TableBodyCell({ children, ...props }: { children: React.ReactNode } & TableCellProps) {
    return (
        <TableCell
            sx={[
                (theme) => ({
                    whiteSpace: 'nowrap',
                    borderBottomColor: theme.palette.secondary.contrastText,
                }),
                (theme) => ({ ...(typeof props?.sx === 'function' ? props.sx(theme) : props.sx) }),
            ]}
            {...props}
        >
            {children}
        </TableCell>
    );
}
