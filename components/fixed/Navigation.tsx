import { LinkImage } from "../molecules";
import {  Search, DirectionsCar, Chat,Person} from '@material-symbols-svg/react';
import { Icon } from "@/components/atoms/presentation";
import { css } from "@/styled-system/css"; 

interface NavigationProps {
    direction?: 'row' | 'column';
}


export default function Navigation({ direction = 'column' }: NavigationProps) {
    
    return (
        
        <nav className={css({ display: 'flex', flexDirection: direction, gap: '12px',width: '100%',alignItems: 'center',justifyContent: 'center'})}>
            <ul className={css({display: 'flex',flexDirection: direction,width:'100%',alignItems: 'center',justifyContent: 'space-between'})}>
                <li>
                    <LinkImage
                        href="/"
                        Icon={<Icon><Search /></Icon>}
                        text='Buscar'
                        direction='column'
                    />
                </li>
                <li>
                    <LinkImage
                        href="/runs/monitoring"
                        Icon={<Icon><DirectionsCar /></Icon>}
                        text='Carros'
                        direction='column'
                    />
                </li>
                <li>
                    <LinkImage
                        href="/chat"
                        Icon={<Icon><Chat /></Icon>}
                        text='Chat'
                        direction='column'
                    />
                </li>
                <li>
                    <LinkImage
                        href="/profile"
                        Icon={<Icon><Person /></Icon>}
                        text='Perfil'
                        direction='column'
                    />
                </li>
            </ul>
        </nav>
    );
}

