// components/fixed/MessageHeader.tsx
import { css } from "@/styled-system/css"; 
import { Text } from '@/components/atoms/typography';
import { Flex, Box } from '@/styled-system/jsx';
import { Avatar } from '@/components/atoms/presentation';
import { ArrowBack } from '@material-symbols-svg/react';
import { Icon } from "@/components/atoms/presentation";
import { useRouter } from 'next/navigation';

interface MessageHeaderProps {
  driverName?: string;
  routeInfo?: string;
  avatarUrl?: string;
  onBack?: () => void;
}

export default function MessageHeader({ 
  driverName = "Carregando...", 
  routeInfo = "Sincronizando sala...", 
  avatarUrl = "/driver-placeholder.png",
  onBack 
}: MessageHeaderProps) {
  const router = useRouter();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      router.push('/chat');
    }
  };

  return (
    <header className={css({ 
      bg: '#262626', 
      color: 'white', 
      py: '3', 
      display: 'flex', 
      flexDirection: 'row', 
      justifyContent: 'space-between', 
      px: '4', 
      backgroundColor: 'rgb(38, 38, 38)', 
      width: '100%',
      minHeight: '76px',
      position: 'sticky',
      top: 0,
      zIndex: 50
    })}>
      <Flex align="center" gap="3" direction="row" flex="1" overflow="hidden">
        <button onClick={handleBack} className={css({ cursor: 'pointer', display: 'flex', alignItems: 'center', bg: 'transparent', border: 'none', color: 'white' })}>
          <Icon size="lg"><ArrowBack /></Icon>
        </button>
        
        <Avatar src={avatarUrl} size="md" />
        
        <Flex direction="column" overflow="hidden">
          <Text weight="bold" size="md" style={{ color: 'white', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {driverName}
          </Text>
          <Flex align="center" gap="1.5">
            <Box className={css({ w: '8px', h: '8px', bg: 'emerald.500', borderRadius: 'full', flexShrink: 0 })} />
            <Text size="xs" style={{ color: '#a7f3d0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {routeInfo}
            </Text>
          </Flex>
        </Flex>
      </Flex>
    </header>
  );
}