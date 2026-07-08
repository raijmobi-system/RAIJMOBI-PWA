"use client";

import React, { useState, useEffect } from "react";
import { css } from "../../../styled-system/css";
import { flex } from "../../../styled-system/patterns";

import { Flex } from '@/styled-system/jsx';
import FrameComponent from "@/components/organisms/FrameComponent";
import { Text } from '@/components/atoms/typography';

// Interface que espelha o formato padrão do django-easy-audit
interface DjangoAuditLog {
  id: string;
  user_name: string;      
  content_type: string;   
  object_repr: string;    
  event_type: 1 | 2 | 3;  // 1 = CRIAÇÃO, 2 = EDIÇÃO, 3 = EXCLUSÃO
  datetime: string;       
  origem_servico?: string; // Injetado dinamicamente no mapeamento do front
}

export default function AdminLogsDashboard() {
  const [logs, setLogs] = useState<DjangoAuditLog[]>([]);
  const [filtroTexto, setFiltroTexto] = useState("");
  const [filtroModulo, setFiltroModulo] = useState("TODOS");
  const [loading, setLoading] = useState(true);

  // Função centralizada que bate em todos os microsserviços via Kong de forma paralela
  const carregarLogsDosMicrosservicos = async () => {
    try {
      setLoading(true);
      
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      
      if (!token) {
        setLogs([]);
        return;
      }

      const headers: HeadersInit = {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      };

      const queryParams = new URLSearchParams({ busca: filtroTexto }).toString();

      // Mapeamento dos endpoints respeitando a tabela de rotas do seu kong.yml
      const endpoints = [
        { nome: "User Service", url: `http://localhost:8000/api/admin-logs/?${queryParams}` },
        { nome: "Ride Service", url: `http://localhost:8000/api/ride/admin-logs/?${queryParams}` },
        { nome: "Chat Service", url: `http://localhost:8000/api/chat/admin-logs/?${queryParams}` }
      ];

      // Filtra dinamicamente se o operador escolher um serviço específico
      const endpointsParaBuscar = filtroModulo === "TODOS" 
        ? endpoints 
        : endpoints.filter(e => e.nome === filtroModulo);

      // Dispara as requisições em paralelo (Promise.all) para máxima performance
      const promessas = endpointsParaBuscar.map(async (servico) => {
        try {
          const resposta = await fetch(servico.url, { method: "GET", headers, mode: "cors" });
          if (!resposta.ok) return [];
          const dados: DjangoAuditLog[] = await resposta.json();
          
          // Anexa a tag de qual microsserviço gerou esse evento de auditoria
          return dados.map(log => ({ ...log, origem_servico: servico.nome }));
        } catch (err) {
          console.error(`Erro ao buscar logs do ${servico.nome}:`, err);
          return [];
        }
      });

      const resultados = await Promise.all(promessas);
      const todosOsLogs = resultados.flat();

      // Ordenação decrescente: O log mais recente sempre fica no topo da tabela
      todosOsLogs.sort((a, b) => new Date(b.datetime).getTime() - new Date(a.datetime).getTime());

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

  const extrairData = (isoString: string) => {
    try {
      return new Date(isoString).toLocaleDateString('pt-BR');
    } catch {
      return "--/--/----";
    }
  };

  const extrairHora = (isoString: string) => {
    try {
      return new Date(isoString).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    } catch {
      return "--:--";
    }
  };

  const traduzirAcao = (eventType: number) => {
    if (eventType === 1) return "CRIAÇÃO";
    if (eventType === 2) return "EDIÇÃO";
    if (eventType === 3) return "EXCLUSÃO";
    return "ALTERAÇÃO";
  };

  return (
    <FrameComponent>
      {/* Barra de Seleção e Pesquisa Global */}
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

      {/* Grid / Tabela Unificada */}
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
              logs.map((log, index) => (
                <tr 
                  key={`${log.origem_servico}-${log.id}`} 
                  className={css({ 
                    backgroundColor: index % 2 === 0 ? "white" : "gray.50",
                    borderBottom: "1px solid", 
                    borderColor: "gray.100",
                    _hover: { backgroundColor: "gray.100/70" }
                  })}
                >
                  <td className={css({ padding: "12px 16px", fontSize: "sm", fontWeight: "semibold", color: "gray.800" })}>
                    {log.user_name || "Sistema"}
                  </td>
                  
                  <td className={css({ padding: "12px 16px", fontSize: "sm", color: "gray.600" })}>
                    {extrairData(log.datetime)}
                  </td>
                  
                  <td className={css({ padding: "12px 16px", fontSize: "sm", fontWeight: "medium", color: "gray.700" })}>
                    {extrairHora(log.datetime)}
                  </td>
                  
                  {/* Badge visual identificando o serviço e limpando a string 'Auditoria' */}
                  <td className={css({ padding: "12px 16px", fontSize: "xs", color: "gray.600", fontWeight: "semibold" })}>
                    <div className={css({ color: "teal.600", fontSize: "10px", fontWeight: "extrabold", textTransform: "uppercase", mb: "0.5" })}>{log.origem_servico}</div>
                    <div className={css({ fontSize: "11px", color: "gray.500" })}>{log.content_type.replace("Auditoria ", "")}</div>
                  </td>

                  <td className={css({ padding: "12px 16px" })}>
                    <span className={css({ 
                      fontSize: "9px", 
                      fontWeight: "extrabold", 
                      px: "1.5", 
                      py: "0.5", 
                      borderRadius: "md",
                      backgroundColor: log.event_type === 1 ? "green.50" : log.event_type === 3 ? "red.50" : "amber.50",
                      color: log.event_type === 1 ? "green.700" : log.event_type === 3 ? "red.700" : "amber.800"
                    })}>
                      {traduzirAcao(log.event_type)}
                    </span>
                  </td>
                  
                  <td className={css({ padding: "12px 16px", fontSize: "sm", color: "gray.600", maxWidth: "320px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" })} title={log.object_repr}>
                    {log.object_repr}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </FrameComponent>
  );
}