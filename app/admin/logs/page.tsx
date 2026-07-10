"use client";

import React, { useState, useEffect } from "react";
import { css } from "../../../styled-system/css";
import { flex } from "../../../styled-system/patterns";

import { Flex } from '@/styled-system/jsx';
import FrameComponent from "@/components/organisms/FrameComponent";
import { Text } from '@/components/atoms/typography';

// Importa a instância customizada e protegida do Axios
import { api } from "@/services/InterceptRequisition"; 

// 1. Interface atualizada para bater 100% com o JSON real do Django
interface DjangoAuditLog {
  id: number;
  quem_mexeu: string;      
  data: string;   
  hora: string;    
  microsservico: string;  
  acao: string; // "Create", "Update", "Delete", etc.     
  no_que_mexeu: string;       
  origem_servico?: string; 
}

export default function AdminLogsDashboard() {
  const [logs, setLogs] = useState<DjangoAuditLog[]>([]);
  const [filtroTexto, setFiltroTexto] = useState("");
  const [filtroModulo, setFiltroModulo] = useState("TODOS");
  const [loading, setLoading] = useState(true);

  const carregarLogsDosMicrosservicos = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({ busca: filtroTexto }).toString();

      // Altere as URLs para incluir o /api antes do caminho do microsserviço:
  const endpoints = [
  { nome: "User Service", url: `/api/admin-logs/?${queryParams}` },
  { nome: "Ride Service", url: `/api/ride/admin-logs/?${queryParams}` },
  { nome: "Chat Service", url: `/api/chat/admin-logs/?${queryParams}` }
];
      const endpointsParaBuscar = filtroModulo === "TODOS" 
        ? endpoints 
        : endpoints.filter(e => e.nome === filtroModulo);

      const promessas = endpointsParaBuscar.map(async (servico) => {
        try {
          const resposta = await api.get(servico.url);
          const dados: DjangoAuditLog[] = resposta.data;
          
          return dados.map(log => ({ ...log, origem_servico: servico.nome }));
        } catch (err) {
          console.error(`Erro ao buscar logs do ${servico.nome}:`, err);
          return [];
        }
      });

      const resultados = await Promise.all(promessas);
      const todosOsLogs = resultados.flat();

      // 2. Ajustada a ordenação baseando-se nos campos de data e hora reais
      todosOsLogs.sort((a, b) => {
        const dataA = `${a.data.split('/').reverse().join('-')}T${a.hora}`;
        const dataB = `${b.data.split('/').reverse().join('-')}T${b.hora}`;
        return new Date(dataB).getTime() - new Date(dataA).getTime();
      });

      setLogs(todosOsLogs);
    } catch (error) {
      console.error("Falha ao sincronizar logs da aplicação distribuída:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      carregarLogsDosMicrosservicos();
    }, 300); 

    return () => clearTimeout(delayDebounce);
  }, [filtroTexto, filtroModulo]);

  // 3. Função estilizada para crachás de Ação baseados em String
  const estilizarAcao = (acao: string) => {
    const acaoFormatada = acao.toUpperCase();
    if (acaoFormatada === "CREATE") return { texto: "CRIAÇÃO", bg: "green.50", color: "green.700" };
    if (acaoFormatada === "UPDATE") return { texto: "EDIÇÃO", bg: "amber.50", color: "amber.800" };
    if (acaoFormatada === "DELETE") return { texto: "EXCLUSÃO", bg: "red.50", color: "red.700" };
    return { texto: acaoFormatada, bg: "gray.50", color: "gray.700" };
  };

  return (
    <FrameComponent>
      <div className={flex({ direction: { base: "column", sm: "row" }, gap: "3", padding: "24px 16px 16px 16px", backgroundColor: "white" })}>
        <input
          type="text"
          placeholder="Buscar por quem mexeu ou conteúdo da alteração..."
          value={filtroTexto}
          onChange={(e) => setFiltroTexto(e.target.value)}
          className={css({
            flex: 2,
            padding: "10px 14px",
            borderRadius: "xl",
            border: "1px solid",
            borderColor: "gray.200",
            fontSize: "sm",
            outline: "none",
            backgroundColor: "white",
            _focus: { borderColor: "green.700" }
          })}
        />
        
        <select
          value={filtroModulo}
          onChange={(e) => setFiltroModulo(e.target.value)}
          className={css({
            flex: 1,
            padding: "10px 14px",
            borderRadius: "xl",
            border: "1px solid",
            borderColor: "gray.200",
            fontSize: "sm",
            backgroundColor: "white",
            cursor: "pointer",
            _focus: { borderColor: "green.700" }
          })}
        >
          <option value="TODOS">Todos os Serviços</option>
          <option value="User Service">User Service (Usuários)</option>
          <option value="Ride Service">Ride Service (Caronas)</option>
          <option value="Chat Service">Chat Service (Mensagens)</option>
        </select>
      </div>

      <div className={css({ padding: "0 16px 24px 16px", overflowX: "auto" })}>
        <table className={css({ width: "100%", borderCollapse: "collapse", minWidth: "750px", border: "1px solid", borderColor: "gray.200" })}>
          <thead>
            <tr className={css({ backgroundColor: "#2d3748", color: "white" })}>
              <th className={css({ padding: "12px 16px", fontSize: "xs", fontWeight: "bold", textAlign: "left", textTransform: "uppercase" })}>Quem Mexeu</th>
              <th className={css({ padding: "12px 16px", fontSize: "xs", fontWeight: "bold", textAlign: "left", textTransform: "uppercase", width: "110px" })}>Data</th>
              <th className={css({ padding: "12px 16px", fontSize: "xs", fontWeight: "bold", textAlign: "left", textTransform: "uppercase", width: "90px" })}>Hora</th>
              <th className={css({ padding: "12px 16px", fontSize: "xs", fontWeight: "bold", textAlign: "left", textTransform: "uppercase", width: "150px" })}>Microsserviço</th>
              <th className={css({ padding: "12px 16px", fontSize: "xs", fontWeight: "bold", textAlign: "left", textTransform: "uppercase", width: "110px" })}>Ação</th>
              <th className={css({ padding: "12px 16px", fontSize: "xs", fontWeight: "bold", textAlign: "left", textTransform: "uppercase" })}>No Que Mexeu</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className={css({ padding: "32px", textAlign: "center", backgroundColor: "white" })}>
                  <Text color="muted" size="sm">Sincronizando auditoria cruzada dos microsserviços...</Text>
                </td>
              </tr>
            ) : logs.length === 0 ? (
              <tr>
                <td colSpan={6} className={css({ padding: "32px", textAlign: "center", backgroundColor: "white" })}>
                  <Text color="muted" size="sm">Nenhum log retornado para o termo buscado.</Text>
                </td>
              </tr>
            ) : (
              logs.map((log, index) => {
                const badge = estilizarAcao(log.acao);
                return (
                  <tr 
                    key={`${log.origem_servico}-${log.id}`} 
                    className={css({ 
                      backgroundColor: index % 2 === 0 ? "white" : "gray.50",
                      borderBottom: "1px solid", 
                      borderColor: "gray.100",
                      _hover: { backgroundColor: "gray.100/70" }
                    })}
                  >
                    {/* Quem Mexeu */}
                    <td className={css({ padding: "12px 16px", fontSize: "sm", fontWeight: "semibold", color: "gray.800" })}>
                      {log.quem_mexeu || "Sistema"}
                    </td>
                    
                    {/* Data */}
                    <td className={css({ padding: "12px 16px", fontSize: "sm", color: "gray.600" })}>
                      {log.data}
                    </td>
                    
                    {/* Hora */}
                    <td className={css({ padding: "12px 16px", fontSize: "sm", fontWeight: "medium", color: "gray.700" })}>
                      {log.hora}
                    </td>
                    
                    {/* Microsserviço */}
                    <td className={css({ padding: "12px 16px", fontSize: "xs", color: "gray.600", fontWeight: "semibold" })}>
                      <div className={css({ color: "teal.600", fontSize: "10px", fontWeight: "extrabold", textTransform: "uppercase", mb: "0.5" })}>{log.origem_servico}</div>
                      <div className={css({ fontSize: "11px", color: "gray.500" })}>{log.microsservico}</div>
                    </td>

                    {/* Ação */}
                    <td className={css({ padding: "12px 16px" })}>
                      <span className={css({ 
                        fontSize: "9px", 
                        fontWeight: "extrabold", 
                        px: "1.5", 
                        py: "0.5", 
                        borderRadius: "md",
                        backgroundColor: badge.bg,
                        color: badge.color
                      })}>
                        {badge.texto}
                      </span>
                    </td>
                    
                    {/* No que Mexeu */}
                    <td className={css({ padding: "12px 16px", fontSize: "sm", color: "gray.600", maxWidth: "320px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" })} title={log.no_que_mexeu}>
                      {log.no_que_mexeu}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </FrameComponent>
  );
}