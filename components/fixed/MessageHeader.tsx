import { css } from "@/styled-system/css"; 
import {Text} from '@/components/atoms/typography';
import { Flex,Box } from '@/styled-system/jsx';
import {Avatar} from '@/components/atoms/presentation';
import {  ArrowBack } from '@material-symbols-svg/react';
import { Icon } from "@/components/atoms/presentation";
import { useRouter } from 'next/navigation';



export default function MessageHeader() {
  const router = useRouter();
    return(
      
        <header className={css({ bg: '#262626', color: 'white', py: '4' ,display: 'flex',flexDirection: 'row',justifyContent:'space-between',px:'6',backgroundColor:'rgb(38, 38, 38)',opacity:'1',maxHeight:'88px'})}>
          
                  <Flex 
                          align="center" 
                          bg="" 
                          color="white" 
                          p="4" 
                          gap="4"
                          direction='row'
                          flex='1'
                        >
                          <button onClick={() => router.push('/chat')} className={css({ cursor: 'pointer' })}>
                            <Icon size="lg"><ArrowBack /></Icon>
                          </button>
                          
                          <Avatar src="rafael.jpeg" size="md" />
                          
                          <Flex direction="column">
                            <Text weight="bold" size="lg">Rafael Fernandes</Text>
                            <Flex align="center" gap="1">
                              <Box className={css({ w: '8px', h: '8px', bg: 'green.500', borderRadius: 'full' })} />
                              <Text size="sm" color="success">Online</Text>
                            </Flex>
                          </Flex>
                        </Flex>
                </header>
    );
}