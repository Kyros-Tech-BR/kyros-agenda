const serviceTemplates = {
  beauty: [
  { id: "corte", name: "Corte feminino", price: 95, minutes: 50 },
  { id: "escova", name: "Escova modelada", price: 70, minutes: 40 },
  { id: "coloracao", name: "Coloracao", price: 180, minutes: 120 },
  { id: "manicure", name: "Manicure", price: 38, minutes: 45 },
  { id: "sobrancelha", name: "Design de sobrancelha", price: 45, minutes: 30 }
  ],
  barber: [
    { id: "corte", name: "Corte de cabelo", price: 45, minutes: 40 },
    { id: "barba", name: "Barba", price: 35, minutes: 30 },
    { id: "corte_barba", name: "Corte + barba", price: 75, minutes: 70 },
    { id: "pigmentacao", name: "Pigmentacao", price: 50, minutes: 45 },
    { id: "sobrancelha", name: "Sobrancelha", price: 25, minutes: 20 }
  ],
  unisex: [
    { id: "corte", name: "Corte", price: 60, minutes: 45 },
    { id: "barba", name: "Barba", price: 35, minutes: 30 },
    { id: "escova", name: "Escova", price: 70, minutes: 40 },
    { id: "sobrancelha", name: "Sobrancelha", price: 35, minutes: 25 }
  ]
};

const salonWhatsApp = "5538997257847";
const defaultBusiness = {
  type: "beauty",
  name: "Studio Bella",
  whatsapp: salonWhatsApp,
  logo: "",
  services: serviceTemplates.beauty
};

const seedClients = [
  { name: "Maria Silva", phone: "(11) 98765-4321", initials: "MS", color: "#f36b8a" },
  { name: "Ana Paula", phone: "(11) 97654-3210", initials: "AP", color: "#f6b333" },
  { name: "Juliana Costa", phone: "(11) 96543-2109", initials: "JC", color: "#47b96f" },
  { name: "Carla Souza", phone: "(11) 95432-1098", initials: "CS", color: "#8e44ad" },
  { name: "Beatriz Lima", phone: "(11) 94321-0987", initials: "BL", color: "#87909a" }
];

const storageKey = "studio-bella-system-v2";
const hours = ["08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00"];

const state = {
  screen: "agendaScreen",
  selectedClient: seedClients[0].phone,
  selectedDate: todayIso()
};

const elements = {
  title: document.querySelector("#screenTitle"),
  backButton: document.querySelector("#backButton"),
  topAction: document.querySelector("#topAction"),
  screens: [...document.querySelectorAll(".screen")],
  navButtons: [...document.querySelectorAll("[data-open]")],
  form: document.querySelector("#bookingForm"),
  timeline: document.querySelector("#timeline"),
  timelineTemplate: document.querySelector("#timelineTemplate"),
  clientTemplate: document.querySelector("#clientTemplate"),
  clientList: document.querySelector("#clientList"),
  clientSearch: document.querySelector("#clientSearch"),
  clientDetail: document.querySelector("#clientDetail"),
  serviceSelect: document.querySelector("#service"),
  businessForm: document.querySelector("#businessForm"),
  businessType: document.querySelector("#businessType"),
  businessName: document.querySelector("#businessName"),
  businessWhatsApp: document.querySelector("#businessWhatsApp"),
  businessLogo: document.querySelector("#businessLogo"),
  logoPreview: document.querySelector("#logoPreview"),
  topLogo: document.querySelector("#topLogo"),
  settingsServiceList: document.querySelector("#settingsServiceList"),
  date: document.querySelector("#date"),
  time: document.querySelector("#time"),
  prettyDate: document.querySelector("#prettyDate"),
  weekday: document.querySelector("#weekday"),
  prevDay: document.querySelector("#prevDay"),
  nextDay: document.querySelector("#nextDay"),
  todayCount: document.querySelector("#todayCount"),
  revenue: document.querySelector("#revenue"),
  serviceCount: document.querySelector("#serviceCount")
};

function todayIso() {
  const now = new Date();
  const offset = now.getTimezoneOffset() * 60000;
  return new Date(now.getTime() - offset).toISOString().slice(0, 10);
}

function uuid() {
  if (crypto?.randomUUID) return crypto.randomUUID();
  return `id-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function addDays(isoDate, days) {
  const date = new Date(`${isoDate}T12:00:00`);
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

function formatDate(isoDate) {
  const date = new Date(`${isoDate}T12:00:00`);
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric"
  }).format(date);
}

function formatWeekday(isoDate) {
  const date = new Date(`${isoDate}T12:00:00`);
  return new Intl.DateTimeFormat("pt-BR", { weekday: "long" }).format(date);
}

function money(value) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0
  }).format(value);
}

function whatsappNumber(phone) {
  const digits = String(phone || "").replace(/\D/g, "");
  if (!digits) return readData().business.whatsapp;
  if (digits.startsWith("55")) return digits;
  return `55${digits}`;
}

function whatsappLink(phone, message) {
  return `https://wa.me/${whatsappNumber(phone)}?text=${encodeURIComponent(message)}`;
}

function initialData() {
  return {
    business: defaultBusiness,
    clients: seedClients,
    appointments: [
      appointment("Maria Silva", "(11) 98765-4321", "escova", todayIso(), "09:00", "confirmed", ""),
      appointment("Ana Paula", "(11) 97654-3210", "corte", todayIso(), "10:00", "confirmed", ""),
      appointment("Juliana Costa", "(11) 96543-2109", "coloracao", todayIso(), "14:00", "waiting", "Cliente prefere tonalidade fria."),
      appointment("Carla Souza", "(11) 95432-1098", "manicure", todayIso(), "15:30", "confirmed", "")
    ]
  };
}

function readData() {
  const saved = localStorage.getItem(storageKey);
  if (!saved) {
    const data = initialData();
    writeData(data);
    return data;
  }
  const data = JSON.parse(saved);
  return {
    ...data,
    business: {
      ...defaultBusiness,
      ...(data.business || {}),
      services: data.business?.services?.length ? data.business.services : defaultBusiness.services
    }
  };
}

function writeData(data) {
  localStorage.setItem(storageKey, JSON.stringify(data));
}

function appointment(client, phone, serviceId, date, time, status, note) {
  return {
    id: uuid(),
    client,
    phone,
    serviceId,
    date,
    time,
    status,
    note
  };
}

function serviceById(id) {
  const services = readData().business.services;
  return services.find((service) => service.id === id) || services[0];
}

function openScreen(id) {
  state.screen = id;
  elements.screens.forEach((screen) => screen.classList.toggle("active", screen.id === id));
  elements.navButtons.forEach((button) => button.classList.toggle("active", button.dataset.open === id));

  const screen = document.querySelector(`#${id}`);
  elements.title.textContent = screen.dataset.title;
  elements.backButton.classList.toggle("is-hidden", id === "agendaScreen");
  elements.topAction.textContent = id === "agendaScreen" ? "+" : " ";
  elements.topAction.disabled = id !== "agendaScreen";
  render();
}

function renderSummary(data) {
  const todays = data.appointments.filter((item) => item.date === state.selectedDate && item.status !== "finished");
  elements.prettyDate.textContent = formatDate(state.selectedDate);
  elements.weekday.textContent = formatWeekday(state.selectedDate);
  elements.todayCount.textContent = todays.length;
  elements.revenue.textContent = money(todays.reduce((total, item) => total + serviceById(item.serviceId).price, 0));
  elements.businessType.value = data.business.type;
  elements.businessName.value = data.business.name;
  elements.businessWhatsApp.value = data.business.whatsapp.replace(/^55/, "");
  elements.topLogo.hidden = !data.business.logo;
  if (data.business.logo) elements.topLogo.src = data.business.logo;
  elements.logoPreview.innerHTML = data.business.logo
    ? `<img src="${data.business.logo}" alt="Logo atual" /><button type="button" data-action="remove-logo">Remover logo</button>`
    : "<span>Nenhuma logo adicionada</span>";
  elements.settingsServiceList.innerHTML = data.business.services
    .map(
      (service) => `
        <article class="service-editor" data-service-id="${service.id}">
          <label>
            Servico
            <input data-service-field="name" value="${service.name}" />
          </label>
          <label>
            Valor
            <input data-service-field="price" inputmode="decimal" value="${service.price}" />
          </label>
          <label>
            Min
            <input data-service-field="minutes" inputmode="numeric" value="${service.minutes}" />
          </label>
        </article>
      `
    )
    .join("");
}

function renderTimeline(data) {
  elements.timeline.innerHTML = "";
  const todays = data.appointments.filter((item) => item.date === state.selectedDate && item.status !== "finished");
  const visibleHours = [...new Set([...hours, ...todays.map((item) => item.time)])].sort();

  visibleHours.forEach((hour) => {
    const appointmentsAtHour = todays.filter((item) => item.time === hour);

    if (appointmentsAtHour.length) {
      appointmentsAtHour.forEach((found) => {
        const row = elements.timelineTemplate.content.firstElementChild.cloneNode(true);
        row.querySelector("time").textContent = hour;
        const pill = row.querySelector(".appointment-pill");
      const service = serviceById(found.serviceId);
      pill.classList.add(found.status === "confirmed" ? "confirmed" : "waiting");
      pill.dataset.phone = found.phone;
      pill.dataset.id = found.id;
      pill.innerHTML = `
        <strong>${found.client}</strong>
        <span>${service.name}</span>
        <em>${found.status === "confirmed" ? "Confirmado" : "Pendente"}</em>
        <small class="pill-actions">
          ${found.status === "confirmed" ? "" : '<span data-action="confirm">Confirmar WhatsApp</span>'}
          <span data-action="finish">Finalizar</span>
          <span data-action="cancel">Cancelar</span>
        </small>
      `;
        elements.timeline.appendChild(row);
      });
    } else {
      const row = elements.timelineTemplate.content.firstElementChild.cloneNode(true);
      row.querySelector("time").textContent = hour;
      const pill = row.querySelector(".appointment-pill");
      pill.classList.add("free");
      pill.textContent = "Horario livre";
      elements.timeline.appendChild(row);
    }
  });
}

function renderClients(data) {
  const query = elements.clientSearch.value.trim().toLowerCase();
  const clients = data.clients.filter((client) => {
    const text = `${client.name} ${client.phone}`.toLowerCase();
    return text.includes(query);
  });

  elements.clientList.innerHTML = "";
  clients.forEach((client) => {
    const node = elements.clientTemplate.content.firstElementChild.cloneNode(true);
    node.dataset.phone = client.phone;
    node.querySelector(".avatar").textContent = client.initials;
    node.querySelector(".avatar").style.background = client.color;
    node.querySelector("strong").textContent = client.name;
    node.querySelector("small").textContent = `${client.phone} - ultimo atendimento recente`;
    elements.clientList.appendChild(node);
  });
}

function renderDetail(data) {
  const client = data.clients.find((item) => item.phone === state.selectedClient) || data.clients[0];
  const history = data.appointments.filter((item) => item.phone === client.phone);
  const lastService = history.length ? serviceById(history[history.length - 1].serviceId).name.toLowerCase() : "um novo corte de cabelo";
  const businessName = data.business.name;
  const messages = [
    {
      label: "Sentimos sua falta",
      text: `Oi, ${client.name}! Aqui e do ${businessName}. Estamos sentindo sua falta. Faz tempo que voce nao faz uma visita. Que tal agendar ${lastService}?`
    },
    {
      label: "Novo corte",
      text: `Oi, ${client.name}! Que tal renovar o visual esta semana? Temos horarios no ${businessName}. Posso te mandar algumas opcoes?`
    },
    {
      label: "Confirmar horario",
      text: `Ola, ${client.name}! Aqui e do ${businessName}. Podemos confirmar seu horario?`
    }
  ];
  elements.clientDetail.innerHTML = `
    <section class="profile-card">
      <span class="avatar large" style="background:${client.color}">${client.initials}</span>
      <h2>${client.name}</h2>
      <p>${client.phone}</p>
      <a class="whatsapp-button" href="${whatsappLink(client.phone, messages[2].text)}" target="_blank" rel="noopener">Chamar no WhatsApp</a>
      <button type="button" class="outline-button" data-open="newScreen">Novo agendamento</button>
    </section>
    <section class="history-card">
      <h3>Mensagens prontas</h3>
      <div class="message-grid">
        ${messages
          .map(
            (message) => `
              <a href="${whatsappLink(client.phone, message.text)}" target="_blank" rel="noopener">
                ${message.label}
              </a>
            `
          )
          .join("")}
      </div>
    </section>
    <section class="history-card">
      <h3>Historico de atendimentos</h3>
      ${history
        .map(
          (item) => `
            <article>
              <strong>${item.date.slice(5).replace("-", "/")} - ${item.time}</strong>
              <span>${serviceById(item.serviceId).name}</span>
            </article>
          `
        )
        .join("")}
    </section>
  `;
}

function render() {
  const data = readData();
  renderSummary(data);
  renderTimeline(data);
  renderClients(data);
  renderDetail(data);
}

function updateAppointmentStatus(id, status) {
  const data = readData();
  data.appointments = data.appointments.map((item) => (item.id === id ? { ...item, status } : item));
  writeData(data);
  render();
}

function setupForm() {
  const services = readData().business.services;
  elements.serviceSelect.innerHTML = services
    .map((service) => `<option value="${service.id}">${service.name} - ${money(service.price)}</option>`)
    .join("");
  elements.date.value = todayIso();
  elements.time.value = "08:00";
}

function normalizeBusinessWhatsapp(value) {
  const digits = String(value || "").replace(/\D/g, "");
  if (!digits) return salonWhatsApp;
  return digits.startsWith("55") ? digits : `55${digits}`;
}

function readLogoFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.addEventListener("load", () => resolve(reader.result));
    reader.addEventListener("error", () => reject(reader.error));
    reader.readAsDataURL(file);
  });
}

function applyBusinessTemplate(type) {
  const data = readData();
  const nextName = type === "barber" ? "Barbearia Modelo" : type === "unisex" ? "Studio Unissex" : "Studio Bella";
  data.business = {
    ...data.business,
    type,
    name: data.business.name || nextName,
    services: serviceTemplates[type]
  };
  writeData(data);
  setupForm();
  render();
}

function updateService(serviceId, field, value) {
  const data = readData();
  data.business.services = data.business.services.map((service) => {
    if (service.id !== serviceId) return service;
    if (field === "price") return { ...service, price: Number(value.replace(",", ".")) || 0 };
    if (field === "minutes") return { ...service, minutes: Number(value) || 0 };
    return { ...service, name: value.trim() || service.name };
  });
  writeData(data);
  setupForm();
  render();
}

function upsertClient(data, clientName, phone) {
  const cleanPhone = phone || "(11) 99999-9999";
  const exists = data.clients.some((client) => client.phone === cleanPhone);
  if (exists) return;

  data.clients.push({
    name: clientName,
    phone: cleanPhone,
    initials: clientName
      .split(" ")
      .slice(0, 2)
      .map((part) => part[0])
      .join("")
      .toUpperCase(),
    color: "#8e44ad"
  });
}

function wireEvents() {
  document.body.addEventListener("click", (event) => {
    const openButton = event.target.closest("[data-open]");
    if (openButton) openScreen(openButton.dataset.open);

    const clientRow = event.target.closest(".client-row");
    if (clientRow) {
      state.selectedClient = clientRow.dataset.phone;
      openScreen("detailScreen");
    }

    const appointmentPill = event.target.closest(".appointment-pill[data-phone]");
    const templateButton = event.target.closest("[data-template]");
    if (templateButton) {
      applyBusinessTemplate(templateButton.dataset.template);
      return;
    }

    const action = event.target.closest("[data-action]");
    if (action) {
      event.stopPropagation();
      if (action.dataset.action === "remove-logo") {
        const data = readData();
        data.business.logo = "";
        writeData(data);
        render();
        return;
      }
      const pill = action.closest(".appointment-pill");
      if (action.dataset.action === "confirm") updateAppointmentStatus(pill.dataset.id, "confirmed");
      if (action.dataset.action === "finish") updateAppointmentStatus(pill.dataset.id, "finished");
      if (action.dataset.action === "cancel") updateAppointmentStatus(pill.dataset.id, "canceled");
      return;
    }

    if (appointmentPill) {
      state.selectedClient = appointmentPill.dataset.phone;
      openScreen("detailScreen");
    }
  });

  elements.backButton.addEventListener("click", () => openScreen("agendaScreen"));
  elements.topAction.addEventListener("click", () => openScreen("newScreen"));
  elements.clientSearch.addEventListener("input", render);
  elements.prevDay.addEventListener("click", () => {
    state.selectedDate = addDays(state.selectedDate, -1);
    render();
  });
  elements.nextDay.addEventListener("click", () => {
    state.selectedDate = addDays(state.selectedDate, 1);
    render();
  });

  elements.form.addEventListener("submit", (event) => {
    event.preventDefault();
    const form = new FormData(elements.form);
    const data = readData();
    const clientName = form.get("clientName").trim();
    const phone = form.get("clientPhone").trim();
    const appointmentDate = form.get("date");

    upsertClient(data, clientName, phone);
    data.appointments.push(
      appointment(clientName, phone, form.get("service"), appointmentDate, form.get("time"), "waiting", form.get("note").trim())
    );

    writeData(data);
    state.selectedDate = appointmentDate;
    elements.form.reset();
    setupForm();
    openScreen("agendaScreen");
  });

  elements.businessForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const data = readData();
    const type = elements.businessType.value;
    data.business = {
      ...data.business,
      type,
      name: elements.businessName.value.trim() || defaultBusiness.name,
      whatsapp: normalizeBusinessWhatsapp(elements.businessWhatsApp.value),
      services: data.business.services?.length ? data.business.services : serviceTemplates[type]
    };
    writeData(data);
    setupForm();
    render();
  });

  elements.settingsServiceList.addEventListener("change", (event) => {
    const input = event.target.closest("[data-service-field]");
    if (!input) return;
    const row = input.closest("[data-service-id]");
    updateService(row.dataset.serviceId, input.dataset.serviceField, input.value);
  });

  elements.businessLogo.addEventListener("change", async () => {
    const file = elements.businessLogo.files?.[0];
    if (!file) return;
    const data = readData();
    data.business.logo = await readLogoFile(file);
    writeData(data);
    render();
    elements.businessLogo.value = "";
  });
}

setupForm();
wireEvents();
openScreen("agendaScreen");
