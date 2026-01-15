# 📘 Documentação de Validação QA

## Easy Maintenance — MVP Beta

Este documento descreve a estratégia de validação, fluxos principais, casos de teste e checklist de homologação do **Easy Maintenance**, um mini SaaS em fase beta.

O objetivo é permitir que um **time de QA (interno ou externo)** valide estabilidade, segurança e consistência de dados antes da evolução do produto.

---

## 1. Visão Geral do Sistema

O **Easy Maintenance** é um mini SaaS para gestão de **itens de manutenção predial e operacional**, ajudando empresas a manter conformidade regulatória e controle de rotinas internas.

### Problema que resolve

* Falta de controle de manutenções recorrentes
* Risco de não conformidade legal
* Falta de visibilidade de itens vencidos ou próximos do vencimento

### Conceitos principais

* **Organização (Empresa)**
  Entidade principal do sistema. Todos os dados pertencem a uma organização.

* **Usuários**
  Sempre vinculados a uma organização específica.

* **Itens Regulatórios (REGULATORY)**
  Itens regidos por normas externas (ex.: extintores, elevadores, SPDA).
  ➜ Exigem vínculo com uma **Norma**.

* **Itens Operacionais (OPERATIONAL)**
  Itens definidos por política interna da empresa.
  ➜ Utilizam **periodicidade customizada**.

---

## 2. Ambientes

| Ambiente     | Componente          | URL                                                                                                                                                          |
|--------------|---------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Homologação  | Front-end (Next.js) | [https://easy-maintenance-web-production.up.railway.app](https://easy-maintenance-web-production.up.railway.app)                                             |
| Homologação  | Back-end (API)      | [https://easy-maintenance-api-production.up.railway.app](https://easy-maintenance-api-production.up.railway.app)                                             |
| Documentação | Swagger / OpenAPI   | [https://easy-maintenance-api-production.up.railway.app/swagger-ui/index.html](https://easy-maintenance-api-production.up.railway.app/swagger-ui/index.html) |

---

## 3. Perfis de Acesso

### 🔐 Bootstrap Admin (Sistema)

* **Acesso:** Área administrativa privada (`/private/login`)
* **Autenticação:** Token estático via header

```
X-Admin-Token: <BOOTSTRAP_ADMIN_TOKEN>
```

* **Responsabilidades:**

    * Criar organizações
    * Criar usuários iniciais
    * Configuração inicial do sistema

---

### 👤 Usuário Comum

* **Login:** E-mail e senha
* **Escopo:** Apenas dados da própria organização
* **Primeiro acesso:** Obrigatória troca de senha (`firstAccess = true`)

---

## 4. Fluxo Inicial de Setup (Admin)

1. Acessar a área administrativa (`/private/login`)
2. Informar o token de admin
3. Criar uma **Organização**

    * Nome
    * Plano (FREE, PRO, etc.)
    * Código gerado automaticamente
4. Criar um **Usuário**

    * Vinculado ao código da organização
    * Definir senha inicial
    * Status `ACTIVE`
5. Entregar credenciais ao usuário
6. Usuário realiza o **primeiro login**
7. Sistema exige troca de senha

---

## 5. Fluxo de Autenticação

### Login

* **Endpoint:**

```
POST /easy-maintenance/api/v1/auth/login
```

* **Payload:** e-mail + senha
* **Resposta:** JWT + dados do usuário

### Headers obrigatórios nas chamadas autenticadas

```
Authorization: Bearer <JWT>
X-Org-Id: <organizationCode>
```

### Comportamentos esperados

| Cenário               | Resultado esperado     |
|-----------------------|------------------------|
| Credenciais inválidas | 401 Unauthorized       |
| Usuário INACTIVE      | 403 Forbidden          |
| Token ausente         | 401 Unauthorized       |
| Organização inválida  | 403 ou erro de negócio |

---

## 6. Funcionalidades no Escopo de Teste

### Autenticação

* Login válido
* Login inválido
* Primeiro acesso (troca obrigatória de senha)
* Token expirado
* Acesso sem token

### Organizações (Admin)

* Criar organização
* Validação de campos obrigatórios
* Listar organizações
* Bloqueio sem token admin

### Usuários (Admin)

* Criar usuário
* Vínculo correto com organização
* Status ACTIVE / INACTIVE
* Forçar troca de senha no primeiro acesso

### Normas

* Listar normas (`GET /norms`)
* Validar:

    * itemType
    * periodicidade
    * autoridade
    * tolerância

### Itens

#### REGULATORY

* Norma obrigatória
* Periodicidade herdada da norma

#### OPERATIONAL

* Periodicidade customizada obrigatória
* Unidade (DIAS / MESES)

---

## 7. Casos de Teste (Exemplos)

| ID      | Descrição              | Pré-condição            | Passos                        | Resultado Esperado        |
|---------|------------------------|-------------------------|-------------------------------|---------------------------|
| AUTH-01 | Login válido           | Usuário ACTIVE          | Login com credenciais válidas | Redireciona + JWT gerado  |
| AUTH-02 | Primeiro acesso        | Usuário novo            | Login → trocar senha          | Login bloqueado até troca |
| AUTH-03 | Login inválido         | —                       | Senha errada                  | 401                       |
| ORG-01  | Criar organização      | Token admin válido      | Criar organização             | Sucesso                   |
| ORG-02  | Segurança admin        | Sem token               | Criar organização             | 401 / 403                 |
| ITEM-01 | Criar item regulatório | Norma existente         | Criar com norma               | Sucesso                   |
| ITEM-02 | Criar item operacional | —                       | Criar com período             | Sucesso                   |
| ITEM-03 | Validação              | Campo obrigatório vazio | Criar item                    | Erro 400                  |

---

## 8. Dados de Teste Sugeridos

| Tipo             | Exemplo                                             |
|------------------|-----------------------------------------------------|
| Organização      | Hospital Central                                    |
| Usuário Admin    | [admin@hospital.com](mailto:admin@hospital.com)     |
| Usuário Comum    | [tecnico@hospital.com](mailto:tecnico@hospital.com) |
| Item Regulatório | EXTINTOR PQS                                        |
| Item Operacional | AR CONDICIONADO                                     |

---

## 9. Limitações Conhecidas (Beta)

* ❌ Sem envio de e-mails
* ❌ Sem recuperação de senha
* ❌ Sem cobrança
* ⚠️ Funcionalidades ainda em evolução

---

## 10. Checklist Final de QA

* [ ] Admin cria organização
* [ ] Admin cria usuário
* [ ] Primeiro acesso exige troca de senha
* [ ] Login funciona corretamente
* [ ] Normas são listadas
* [ ] Item regulatório exige norma
* [ ] Item operacional exige periodicidade
* [ ] Segurança bloqueia acessos indevidos
* [ ] Dados consistentes entre telas

---

**Status:** Documento validado para início dos testes de QA
**Versão:** MVP Beta
**Data:** 2026-01-15
