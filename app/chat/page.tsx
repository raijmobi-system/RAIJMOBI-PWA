"use client"

import {FrameComponent} from "@/components/organisms";
import { Button, Link, IconButton } from '@/components/atoms/action';
import { Flex } from '@/styled-system/jsx';
import { Icon } from '@/components/atoms/presentation';
import { Text } from '@/components/atoms/typography';
import { Avatar } from '@/components/atoms/presentation';
import {CardComponent} from '@/components/molecules';
import { css } from "@/styled-system/css"; 



export default function ChatPage() {
    return (
        <FrameComponent>
            
            <CardComponent fullWidth={true} direction="row" 
            
            content={<Flex direction="row" gap='4'>
                <Avatar src="cliente.jpeg" />
                <Flex direction="column">
                    <Text><b>Pablo Murilo</b></Text>
                    <Text>Tô chegando no ponto</Text>
                </Flex>
            </Flex>}
            extraContent={
            <Flex  direction='column'>
                <Text>14:59</Text>
                <Icon></Icon>
            </Flex>}/>
            
            <CardComponent fullWidth={true} direction="row"
            
            content={<Flex direction="row" gap={4}>
                <Avatar src="cliente.jpeg" />
                <Flex direction="column">
                    <Text><b>Pablo Murilo</b></Text>
                    <Text>Tô chegando no ponto</Text>
                </Flex>
            </Flex>}
            extraContent={
            <Flex  direction='column'>
                <Text>14:59</Text>
                <Icon></Icon>
            </Flex>}/>
            
        </FrameComponent>
    );
}
     


 