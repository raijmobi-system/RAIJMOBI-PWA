"use client"
import { Text,Label,Heading } from '@/components/atoms/typography';
import { Switch,Textarea,Checkbox,Input } from '@/components/atoms/data'
import { Select } from '@/components/atoms/data';
import { Box } from '@/styled-system/jsx';

interface SelectFieldProps extends React.ComponentProps<typeof Select> {
  label: string;
  id: string;
  options: { value: string; label: string }[];
}

export const SelectField = ({ label, id, options, ...props }: SelectFieldProps) => {
  return (
    <Box display="flex" flexDirection="column" gap="1.5" width="full">
      <Label htmlFor={id} size="sm">
        {label}
      </Label>
      <Select id={id} {...props}>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </Select>
    </Box>
  );
};