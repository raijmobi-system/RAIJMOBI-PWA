import { css } from "@/styled-system/css"; 
import {Heading,Text} from '@/components/atoms/typography';
import { Flex } from '@/styled-system/jsx';
import {Avatar} from '@/components/atoms/presentation';
import {Link} from '@/components/atoms/action';

export default function StandardHeader() {
    return(
        <header className={css({ bg: '#262626', color: 'white', py: '4' ,display: 'flex',flexDirection: 'row',justifyContent:'space-between',px:'6',backgroundColor:'rgb(38, 38, 38)',opacity:'1',maxHeight:'88px'})}>
                  <Flex direction='column' alignItems='start'>
                    <Heading as='h1' size='xl' weight="semibold" color='green' className={css({ textAlign: 'center', mb: '2' })}>
                      Olá, Pablo Murilo !
                    </Heading>
                    <Text color="white" className={css({ textAlign: 'center' })}>
                      Para onde vai hoje?
                    </Text>
                  </Flex>
                  <Link>
                    <Avatar src="/cliente.jpeg" size="fx" />
                  </Link>
        
                </header>
    );
}