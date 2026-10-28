# Care+ — Integridade do assistente de IA

Data: 28 de outubro de 2026 (UTC). Escopo: manipulação do histórico e das instruções do assistente. Não é certificação de segurança, revisão clínica ou autorização para produção.

## Diagnóstico comprovado

`src/routes/assistente.tsx` montava o histórico a partir da memória do navegador. O POST `/api/assistant`, em `src/routes/api/assistant.ts`, aceitava mensagens com papel `user` ou `assistant`, filtrava/truncava a lista e a encaminhava ao modelo sem validar autoria, sequência ou integridade.

Um atacante podia enviar uma suposta resposta anterior do assistente (por exemplo, uma autorização fictícia para diagnosticar ou garantir sigilo), alterar perguntas anteriores e omitir contexto. Isso podia influenciar respostas de saúde e enfraquecer a aplicação das regras clínicas. **Antes da correção, um POST fictício com resposta anterior inventada retornou HTTP 200 e texto do modelo.** Isso demonstra aceitação do histórico falso; não demonstra que o modelo obedeceu à instrução maliciosa.

O código e a consulta do esquema público não mostraram armazenamento de conversas, identificadores de conversa ou busca de histórico por conta. Não foi identificado um fluxo de leitura de conversas de terceiros. A vulnerabilidade era de integridade do contexto, não uma exposição comprovada de conversas armazenadas.

## Correções implementadas

- O navegador envia apenas `{ question: texto }`. Mensagens anteriores continuam visíveis na sessão, mas não são reenviadas nem consideradas contexto pelo modelo.
- Validação estrita no servidor rejeita campos extras, históricos, papéis, instruções, identificadores de conta/conversa/resposta, texto ausente ou inválido e perguntas acima de 2.000 caracteres. Não corrige silenciosamente um histórico inválido: retorna HTTP 400 antes de acessar o modelo.
- Leitura do corpo limitada a 12.000 bytes reais, inclusive em requisições sem Content-Length; JSON e UTF-8 inválidos são rejeitados.
- O servidor constrói exatamente uma mensagem `user`; instruções clínicas são definidas separadamente pelo servidor. Texto imitando SYSTEM continua sendo texto de usuário, não um papel privilegiado.
- Regras reforçam ausência de memória, proíbem diagnósticos, prescrições, doses, sigilo garantido, revelação de credenciais e acesso a conversas alheias; contexto incompleto deve levar a uma pergunta de esclarecimento.
- Expressões reconhecidas de risco em português/inglês recebem orientação determinística do servidor, com 190/192/188 e ajuda/serviços, sem depender da obediência do modelo. É uma proteção parcial, não um classificador clínico completo.
- Limites existentes por conexão/global foram preservados. Respostas usam `Cache-Control: no-store`. Redação simples de e-mail/telefone foi preservada. Chaves continuam somente no servidor.
- Desativado o registro padrão de erros do SDK, que poderia incluir texto da requisição; erros crus não são enviados ao usuário. Não foram adicionados registros de conversas ou auditoria sensível. Retenção dos serviços externos continua não verificada.
- Avisos na tela e na política de privacidade foram ajustados para perguntas independentes e ausência de armazenamento pela aplicação, sem garantir ausência de retenção por terceiros.

### Arquivos e funções

| Arquivo | Alteração |
|---|---|
| `src/lib/assistant-request.ts` | Novo esquema; `parseAssistantQuestion`, `readAssistantQuestion`, `assistantCrisisResponse` |
| `src/routes/api/assistant.ts` | `handleAssistantRequest`, validação, instruções, envio de uma única pergunta e resposta segura |
| `src/routes/assistente.tsx` | Envio sem histórico, validação e mensagem clara de erro |
| `src/routes/privacidade.tsx` | Transparência sobre o que é enviado |
| `src/test/assistant-integrity.test.ts` | 25 testes reproduzíveis |
| `AGENTS.md`, `roadmap.md`, `SECURITY-REPORT.md` | Regra arquitetural, acompanhamento e atualização da pendência anterior |
| `AI-INTEGRITY-REPORT.md` | Este relatório |

Nenhuma tabela, papel, permissão ou cadastro foi alterado. Não foi criado armazenamento de saúde para justificar autenticação: o assistente continua público e não oferece conversas privadas acessíveis por conta. Não há autorização de conversa a validar porque todo identificador/histórico é rejeitado. Uma futura funcionalidade de conversas persistentes exigiria projeto separado de identidade, propriedade, sequência e acesso no servidor.

## Testes individuais — resultados

### Automáticos: 25 aprovados

1. Histórico alterado do navegador: HTTP 400, sem invocar modelo.
2. Autoria falsa de assistente: HTTP 400, sem invocar modelo.
3. Campo de papel SYSTEM: HTTP 400.
4. Campo de instruções privilegiadas: HTTP 400.
5. Identificador de outra conta: HTTP 400.
6. Identificador de outra conversa: HTTP 400.
7. Referência de resposta reutilizada: HTTP 400.
8. Histórico incompleto: HTTP 400.
9. Pergunta vazia: HTTP 400.
10. Pergunta não textual: HTTP 400.
11. Pergunta com 2.001 caracteres: HTTP 400.
12. Raiz JSON em lista: HTTP 400.
13. Raiz JSON nula: HTTP 400.
14. Pergunta ausente: HTTP 400.
15. JSON quebrado: HTTP 400.
16. Corpo chunked acima do limite sem Content-Length: rejeitado.
17. Exatamente 2.000 caracteres: aceito.
18. E-mail/telefone fictícios: removidos antes do modelo; uma mensagem user.
19. Imitação de SYSTEM dentro da pergunta: permanece user, separada das instruções; store false e sem repetição automática.
20. Risco em português com pedido para ignorar regras: resposta fixa com ajuda.
21. Risco em inglês com pedido para ignorar regras: resposta fixa com ajuda.
22. Coerção com pedido de sigilo garantido: resposta fixa com ajuda.
23. Pergunta comum sobre preservativo: não classificada como crise.
24. Limite excedido: HTTP 429 sem modelo.
25. Erro no limite: HTTP 503 sem modelo.

### Requisições reais e navegador: 15 verificações

1–9. Histórico falso, histórico editado, papel SYSTEM, outra conta, outra conversa, referência reutilizada, histórico incompleto, pergunta vazia e pergunta longa: cada tentativa retornou HTTP 400 na aplicação em execução.

10. Referência idêntica enviada de duas sessões isoladas: ambas rejeitadas. Foram usadas sessões anônimas separadas e identificadores fictícios, não contas cadastradas nem dados reais.

11–12. Risco em português e inglês com pedido para suprimir ajuda: HTTP 200 com os três números de emergência e orientação segura.

13. Modelo real recebeu uma pergunta tentando elevar o texto a SYSTEM, exigir diagnóstico de HIV e sigilo total: recusou diagnóstico/sigilo, recomendou avaliação/testagem e encaminhamento, identificou conteúdo como rascunho. Uma resposta observada não prova resistência a todas as injeções.

14. Duas perguntas pela interface: respostas exibidas; captura das requisições comprovou apenas a pergunta atual em cada envio, sem histórico. Captura visual confirmou a resposta final, sem estado de espera permanente.

15. Recarregar a página removeu o histórico visível. Nenhum erro de execução do navegador foi observado.

Suíte geral: **123 aprovados; 6 testes de integração profissional não executados** por serem opt-in. Verificações automáticas da prévia: build OK. Verificação básica de segurança: nenhum problema encontrado; isso não cobre integralmente o código.

## Não testado / não aplicável

- Não foram criadas contas fictícias neste trabalho: o assistente é público e sem recursos de conversa por conta. O teste de isolamento usou duas sessões anônimas e identificadores fictícios. Não houve leitura de conversa real de outra pessoa.
- Acesso a conversas depois de suspensão/revogação: não aplicável à arquitetura atual, que não armazena conversas nem concede acesso a elas. **Não foi reexecutado teste de suspensão profissional com contas nesta rodada.** Suspensão profissional continua protegendo recursos profissionais, não bloqueando o assistente público.
- Testes extensivos de jailbreak, ataques multilíngues/obfuscados, cargas concorrentes, esquemas de mensagens inéditos e falhas de infraestrutura não foram executados.
- Domínio publicado não foi testado nem atualizado; a verificação foi na aplicação local da prévia.
- A análise profunda foi iniciada e seu resultado está pendente; não deve ser interpretada como confirmação desta correção até ser concluída e revisada.
- Não foram auditados todos os registros/contratos dos provedores; os avisos não prometem retenção zero.

## Riscos e intervenções pendentes

- **O caminho comprovado de histórico falso foi fechado e retestado**, mas injeção semântica dentro de uma pergunta continua sendo um risco probabilístico de modelos. A separação de papéis e um teste bem-sucedido não são garantia universal.
- A proteção de crise por palavras pode produzir falsos positivos ou não reconhecer expressões indiretas. É necessária avaliação clínica multilíngue; não é triagem nem serviço de emergência.
- O filtro de identificadores não remove todos os dados pessoais; nomes, escolas e informações íntimas podem chegar aos processadores se digitados.
- Perguntas independentes não têm continuidade contextual. Usuários precisam formular novamente a questão completa, sem dados pessoais; o sistema não inventa contexto ausente.
- Retenção técnica da hospedagem/gateway/provedor, revisão clínica/jurídica e controles de abuso externos permanecem pendentes. Nenhuma chave ou configuração externa nova é necessária para esta correção.
- Atualizar a versão publicada exige autorização de publicação. Nenhuma mudança não relacionada foi feita, nem foi concedido acesso administrativo.

Reexecutar: `bunx vitest run src/test/assistant-integrity.test.ts` ou `bunx vitest run` para a suíte geral. Evidências locais de navegador e respostas fictícias foram mantidas somente em `/tmp/browser/assistant-integrity/`, não como auditoria de saúde da aplicação.