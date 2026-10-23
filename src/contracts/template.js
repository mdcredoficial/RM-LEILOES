const escapeHtml = (value) =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const formatCurrency = (value) =>
  Number(value || 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL"
  });

const formatDateLong = (value) => {
  if (!value) {
    return "";
  }

  const stringValue = String(value).trim();
  const normalizedValue = /^\d{4}-\d{2}-\d{2}/.test(stringValue)
    ? `${stringValue.slice(0, 10)}T12:00:00`
    : value;
  const date = new Date(normalizedValue);
  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "long",
    timeZone: "America/Sao_Paulo"
  }).format(date);
};

const buildSignatureText = (fullName, style = "cursive") => {
  const name = String(fullName || "").trim();
  const parts = name.split(/\s+/).filter(Boolean);

  if (style === "abbrev-cursive") {
    if (parts.length <= 1) {
      return name;
    }

    const [firstName, ...rest] = parts;
    const initials = rest.map((part) => `${part[0].toUpperCase()}.`).join(" ");
    return `${firstName} ${initials}`.trim();
  }

  return name;
};

const formatCompanySignatureText = (value) => String(value || "").trim();

const getSignatureClass = (style = "cursive") => {
  if (style === "hand") {
    return "signature-style-hand";
  }

  if (style === "abbrev-cursive") {
    return "signature-style-abbrev-cursive";
  }

  return "signature-style-cursive";
};

const formatSignatureHash = (value, fallback) => escapeHtml(String(value || fallback || "-"));

export const renderAcquisitionContractHtml = (contract) => {
  const brandName = "RM LEILÕES";
  const sellerLegalName = "RM LEILÕES";
  const sellerCnpj = "53.407.174/0001-30";
  const sellerAddress = "R. Jussara, 800 - Jardim Santa Cecilia - Barueri - SP";
  const sellerSignatureText = escapeHtml(
    formatCompanySignatureText(contract.sellerSignatureText || contract.sellerName)
  );
  const clientSignatureText = escapeHtml(
    contract.clientSignedAt
      ? contract.clientSignatureText ||
          buildSignatureText(contract.clientName, contract.clientSignatureStyle || "cursive")
      : "ASSINATURA DIGITAL DO CLIENTE"
  );
  const clientSignatureStyleClass = getSignatureClass(contract.clientSignatureStyle || "cursive");
  const sellerSignatureStyleClass = getSignatureClass("hand");
  const sellerSignatureHash = formatSignatureHash(contract.sellerSignatureHash, `sig_${String(contract.publicToken || "seller").slice(-8)}`);
  const clientSignatureHash = contract.clientSignedAt
    ? formatSignatureHash(contract.clientSignatureHash, `sig_${String(contract.publicToken || "client").slice(0, 8)}`)
    : "PENDENTE DE ASSINATURA";

  return `
    <article class="contract-document">
      <header class="contract-document__header">
        <div class="contract-document__brand">
          <img src="/rmleiloes.jpeg" alt="${brandName}" />
          <div>
            <strong>${brandName}</strong>
            <span>VEÍCULOS E MAQUINÁRIOS</span>
          </div>
        </div>

        <div class="contract-document__meta">
          <p class="contract-eyebrow">DOCUMENTO PARTICULAR COM ASSINATURA ELETRÔNICA</p>
          <h1>CONTRATO DE AQUISIÇÃO DE VEÍCULOS E MAQUINÁRIOS</h1>
        </div>

        <p class="contract-lead">
          Pelo presente instrumento particular, de um lado <strong>${escapeHtml(sellerLegalName)}</strong>,
          inscrito no CNPJ sob o nº <strong>${sellerCnpj}</strong>, com endereço comercial em
          <strong>${sellerAddress}</strong>,
          doravante denominada VENDEDORA, e de outro lado <strong>${escapeHtml(contract.clientName || "CLIENTE")}</strong>,
          inscrito no CPF sob o nº <strong>${escapeHtml(contract.clientCpf || "-")}</strong>,
          residente e domiciliado em <strong>${escapeHtml(contract.clientAddress || "-")}</strong>,
          doravante denominado COMPRADOR.
        </p>
      </header>

      <section class="contract-section">
        <h2>CLÁUSULA PRIMEIRA - DO OBJETO</h2>
        <p>Este contrato tem por objeto a compra e venda do veículo ou maquinário identificado neste instrumento, nas condições aqui descritas.</p>
        <p><strong>Bem:</strong> ${escapeHtml([contract.vehicleName, contract.vehicleModel, contract.vehicleYear].filter(Boolean).join(" / ") || "-")}</p>
        ${contract.vehicleDescription ? `<p class="contract-vehicle-description">${escapeHtml(contract.vehicleDescription)}</p>` : ""}
      </section>
      <section class="contract-section">
        <h2>CLÁUSULA SEGUNDA - DA RESPONSABILIDADE PELO BEM</h2>
        <p>A VENDEDORA responde pelas informações sobre o bem e pelas condições expressamente descritas neste contrato.</p>
      </section>
      <section class="contract-section">
        <h2>CLÁUSULA TERCEIRA - DA ENTREGA E LIBERAÇÃO</h2>
        <p>A equipe responsável compromete-se a disponibilizar o bem até <strong>${escapeHtml(formatDateLong(contract.deliveryDate) || "-")}</strong>, no endereço informado para entrega: <strong>${escapeHtml(contract.deliveryAddress || "-")}</strong>.</p>
      </section>
      <section class="contract-section">
        <h2>CLÁUSULA QUARTA - DA TRANSFERÊNCIA</h2>
        <p>A transferência da propriedade será providenciada após o pagamento dos valores de documentação ajustados entre as partes. Laudo cautelar, vistoria, revisão e frete serão incluídos somente quando indicados nas condições desta negociação.</p>
        <p>Eventual gravame ou débito identificado deverá ser informado às partes e tratado conforme a responsabilidade e as condições acordadas para esta venda.</p>
      </section>
      <section class="contract-section">
        <h2>CLÁUSULA QUINTA - DO PREÇO E PAGAMENTO</h2>
        <p>O preço total ajustado é de <strong>${formatCurrency(contract.amountValue)}</strong> <strong>(${escapeHtml(contract.amountText || "")})</strong>.</p>
        <p>O pagamento será realizado por <strong>${escapeHtml(contract.paymentMethod || "-")}</strong>, nas condições: <strong>${escapeHtml(contract.paymentNotes || "-")}</strong>. O pagamento deverá ocorrer nos prazos e marcos de liberação informados neste contrato.</p>
      </section>
      <section class="contract-section">
        <h2>CLÁUSULA SEXTA - DA GARANTIA</h2>
        <p>Quando aplicável à negociação, a empresa concede garantia de 12 (doze) meses para motor, câmbio e parte elétrica, conforme condições e limites legais aplicáveis.</p>
      </section>
      <section class="contract-section">
        <h2>CLÁUSULA SÉTIMA - DOS DANOS POR USO</h2>
        <p>A VENDEDORA não responde por danos causados pelo COMPRADOR em razão de negligência ou uso inadequado do bem, observadas as responsabilidades previstas em lei.</p>
      </section>
      <section class="contract-section">
        <h2>CLÁUSULA OITAVA - DA VIGÊNCIA</h2>
        <p>Este instrumento entra em vigor na data da assinatura das partes.</p>
      </section>
      <section class="contract-section">
        <h2>CLÁUSULA NONA - DA DESISTÊNCIA E DO INADIMPLEMENTO</h2>
        <p>O descumprimento das obrigações ou a desistência sujeita a parte responsável à multa de 20% (vinte por cento) do valor total, respeitados os limites e requisitos previstos na legislação aplicável.</p>
      </section>
      <section class="contract-section">
        <h2>CLÁUSULA DÉCIMA - DO ESTADO DO BEM E DO FORO</h2>
        <p>Quando a compra ocorrer sem inspeção presencial, o COMPRADOR declara que tomou ciência das imagens, vídeos e informações disponibilizadas. Divergências deverão ser comunicadas para apuração, sem prejuízo dos direitos legais do consumidor.</p>
        <p>Fica eleito o foro da Comarca de Barueri/SP, observadas as regras legais de competência, para dirimir controvérsias decorrentes deste contrato.</p>
      </section>

      <section class="contract-section contract-section--signatures">
        <p>E, por estarem justas e contratadas, as partes firmam o presente instrumento em 02 (DUAS) vias de igual teor e forma, juntamente com as testemunhas abaixo, para que produza seus jurídicos e legais efeitos.</p>
        <p class="contract-place">SÃO PAULO - SP, <strong>${escapeHtml(formatDateLong(contract.createdAt || new Date()))}</strong>.</p>

        <div class="contract-signature-grid">
          <div class="contract-signature">
            <div class="contract-signature__line ${sellerSignatureStyleClass}">
              ${sellerSignatureText}
            </div>
            <strong>${escapeHtml(contract.sellerName)}</strong>
            <span>VENDEDOR</span>
            <small class="contract-signature__hash">HASH DE SEGURANÇA: ${sellerSignatureHash}</small>
          </div>

          <div class="contract-signature">
            <div class="contract-signature__line ${clientSignatureStyleClass}">
              ${clientSignatureText}
            </div>
            <strong>${escapeHtml(contract.clientName || "CLIENTE")}</strong>
            <span>COMPRADOR</span>
            <small class="contract-signature__hash">HASH DE SEGURANÇA: ${clientSignatureHash}</small>
          </div>
        </div>
      </section>
    </article>
  `;
};
