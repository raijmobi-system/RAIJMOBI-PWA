import { Text,Label,Heading } from '@/components/atoms/typography';
import { Switch,Textarea,Checkbox,Input } from '@/components/atoms/data'


import { Box } from '@/styled-system/jsx';


// Estendemos as propriedades nativas do Input para repassá-las facilmente
interface FormFieldProps extends React.ComponentProps<typeof Input> {
  label: string;
  id: string; // Exigimos um ID para garantir a acessibilidade
}

export const FormField = ({ label, id, ...props }: FormFieldProps) => {
  return (
    // Box com display flex em coluna e um pequeno gap entre o label e o input
    <Box display="flex" flexDirection="column" gap="1.5">
      <Label htmlFor={id} size="sm">
        {label}
      </Label>
      <Input id={id} {...props} />
    </Box>
  );
};