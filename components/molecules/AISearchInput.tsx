
import { Box, Flex } from '@/styled-system/jsx';
import { Text} from '@/components/atoms/typography';
import { Input } from '@/components/atoms/data';

export const AISearchInput = () => {
  return (
    <Box position="relative" width="full">
      <Input 
        placeholder="Descreva sua viagem ideal... Ex: 'carona para praia...'" 
        // Adicionamos padding extra na direita para o texto não ficar sob o botão
        css={{ paddingRight: '12' }} 
      />
      
      {/* Botão absoluto posicionado à direita dentro do container */}
      <Box 
        as="button" 
        position="absolute" 
        right="2" 
        top="50%" 
        transform="translateY(-50%)"
        bg="green.700" 
        color="white"
        width="8" 
        height="8" 
        borderRadius="md"
        display="flex"
        alignItems="center"
        justifyContent="center"
        cursor="pointer"
      >
        {/* Aqui entraria seu átomo de Ícone (ex: SparklesIcon) */}
        ✨
      </Box>
    </Box>
  );
};