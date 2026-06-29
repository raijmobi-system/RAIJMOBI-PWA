"use client";

import { usePathname } from 'next/navigation';
import { LinkImage } from "../molecules";

// Importe as versões normais e as versões com "Fill" no final
import { 
  Search, SearchFill, 
  DirectionsCar, DirectionsCarFill, 
  Chat, ChatFill, 
  Person, PersonFill 
} from '@material-symbols-svg/react';

import { Icon } from "@/components/atoms/presentation";
import { css } from "@/styled-system/css"; 

interface NavigationProps {
    direction?: 'row' | 'column';
}

export default function Navigation({ direction = 'column' }: NavigationProps) {
    const pathname = usePathname() || '';

    // Função inteligente: match exato na home, e suporte a subpastas nas outras rotas
    const checkIsActive = (path: string) => {
        if (path === '/') return pathname === '/';
        return pathname === path || pathname.startsWith(`${path}/`);
    };

    // Armazenamos os booleanos para não repetir a função duas vezes no mesmo Link
    const isHomeActive = checkIsActive('/dashboard');
    const isRunsActive = checkIsActive('/runs');
    const isChatActive = checkIsActive('/chat');
    const isProfileActive = checkIsActive('/profile');
    
    return (
        <nav className={css({ display: 'flex', flexDirection: direction, gap: '12px', width: '100%', alignItems: 'center', justifyContent: 'center' })}>
            <ul className={css({ display: 'flex', flexDirection: direction, width: '100%', alignItems: 'center', justifyContent: 'space-between' })}>
                <li>
                    <LinkImage
                        href="/dashboard"
                        // Renderização condicional do SVG preenchido ou vazado
                        Icon={<Icon>{isHomeActive ? <SearchFill /> : <Search />}</Icon>}
                        text='Buscar'
                        direction='column'
                        isActive={isHomeActive}
                    />
                </li>
                <li>
                    <LinkImage
                        href="/runs"
                        Icon={<Icon>{isRunsActive ? <DirectionsCarFill /> : <DirectionsCar />}</Icon>}
                        text='Caronas'
                        direction='column'
                        isActive={isRunsActive}
                    />
                </li>
                <li>
                    <LinkImage
                        href="/chat"
                        Icon={<Icon>{isChatActive ? <ChatFill /> : <Chat />}</Icon>}
                        text='Chat'
                        direction='column'
                        isActive={isChatActive}
                    />
                </li>
                <li>
                    <LinkImage
                        href="/profile"
                        Icon={<Icon>{isProfileActive ? <PersonFill /> : <Person />}</Icon>}
                        text='Perfil'
                        direction='column'
                        isActive={isProfileActive}
                    />
                </li>
            </ul>
        </nav>
    );
}