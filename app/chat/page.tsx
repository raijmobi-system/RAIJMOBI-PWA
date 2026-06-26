"use client"

import {FrameComponent} from "@/components/organisms";
import { Button, Link, IconButton } from '@/components/atoms/action';
import { Flex } from '@/styled-system/jsx';
import { Icon } from '@/components/atoms/presentation';
import { Text } from '@/components/atoms/typography';
import { Avatar } from '@/components/atoms/presentation';
import {CardComponent} from '@/components/molecules';
import { css } from "@/styled-system/css"; 
import { useRouter } from "next/navigation";


export default function ChatPage() {
    const router = useRouter();
    return (
        <FrameComponent>
            
            <CardComponent fullWidth={true} direction="row" 
            onClick={() => router.push('/runs/monitoring')}
            
            content={<Flex direction="row" gap='4'>
                <Avatar src="/cliente.jpeg" size="fx" />
                <Flex direction="column">
                    <Text color='special' weight="bold">Pablo Murilo</Text>
                    <Text color='muted'>Tô chegando no ponto</Text>
                </Flex>
            </Flex>}
            extraContent={
            <Flex  direction='column'>
                <Text color='muted'>14:59</Text>
                <Icon></Icon>
            </Flex>}/>
            
            
            
        </FrameComponent>
    );
}
     


 