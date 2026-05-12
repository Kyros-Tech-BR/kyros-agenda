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
const cloudConfig = window.KYROS_CONFIG || {};

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
  editingAppointmentId: "",
  selectedDate: todayIso(),
  agendaFilter: "today",
  cloudReady: false,
  cloudStatus: cloudEnabled() ? "checking" : "local",
  cloudMessage: ""
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
  editForm: document.querySelector("#editForm"),
  editId: document.querySelector("#editId"),
  editClientName: document.querySelector("#editClientName"),
  editClientPhone: document.querySelector("#editClientPhone"),
  editService: document.querySelector("#editService"),
  editDate: document.querySelector("#editDate"),
  editTime: document.querySelector("#editTime"),
  editNote: document.querySelector("#editNote"),
  editCancel: document.querySelector("#editCancel"),
  editWhatsapp: document.querySelector("#editWhatsapp"),
  editFinish: document.querySelector("#editFinish"),
  editDelete: document.querySelector("#editDelete"),
  businessForm: document.querySelector("#businessForm"),
  businessType: document.querySelector("#businessType"),
  businessName: document.querySelector("#businessName"),
  businessWhatsApp: document.querySelector("#businessWhatsApp"),
  businessLogo: document.querySelector("#businessLogo"),
  logoPreview: document.querySelector("#logoPreview"),
  topLogo: document.querySelector("#topLogo"),
  cloudStatus: document.querySelector("#cloudStatus"),
  settingsServiceList: document.querySelector("#settingsServiceList"),
  date: document.querySelector("#date"),
  time: document.querySelector("#time"),
  prettyDate: document.querySelector("#prettyDate"),
  weekday: document.querySelector("#weekday"),
  prevDay: document.querySelector("#prevDay"),
  nextDay: document.querySelector("#nextDay"),
  agendaFilterButtons: [...document.querySelectorAll("[data-agenda-filter]")],
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

function isBusinessDay(isoDate) {
  const day = new Date(`${isoDate}T12:00:00`).getDay();
  return day >= 2 && day <= 6;
}

function isBusinessHour(time) {
  return time >= "08:00" && time <= "18:00";
}

function weekDates(startDate) {
  return Array.from({ length: 7 }, (_, index) => addDays(startDate, index));
}

function activeDates() {
  if (state.agendaFilter === "week") return weekDates(state.selectedDate);
  return [state.selectedDate];
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

async function supabaseGet(path) {
  if (!cloudConfig.supabaseUrl || !cloudConfig.supabaseAnonKey) return null;
  const response = await fetch(`${cloudConfig.supabaseUrl}/rest/v1/${path}`, {
    headers: {
      apikey: cloudConfig.supabaseAnonKey,
      Authorization: `Bearer ${cloudConfig.supabaseAnonKey}`
    }
  });
  if (!response.ok) throw new Error(`Supabase ${response.status}`);
  return response.json();
}

async function supabaseRequest(path, options = {}) {
  if (!cloudConfig.supabaseUrl || !cloudConfig.supabaseAnonKey) return null;
  const response = await fetch(`${cloudConfig.supabaseUrl}/rest/v1/${path}`, {
    ...options,
    headers: {
      apikey: cloudConfig.supabaseAnonKey,
      Authorization: `Bearer ${cloudConfig.supabaseAnonKey}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
      ...(options.headers || {})
    }
  });
  if (!response.ok) throw new Error(`Supabase ${response.status}`);
  if (response.status === 204) return null;
  return response.json();
}

function cloudBusinessId() {
  return cloudConfig.demoBusinessId || "";
}

function cloudEnabled() {
  return Boolean(cloudConfig.supabaseUrl && cloudConfig.supabaseAnonKey && cloudBusinessId());
}

function errorMessage(error) {
  return String(error?.message || error || "Erro desconhecido").replace(/^Error:\s*/i, "");
}

function setCloudStatus(status, message = "") {
  state.cloudStatus = status;
  state.cloudMessage = message;
  renderCloudStatus();
}

function renderCloudStatus() {
  if (!elements.cloudStatus) return;
  const labels = {
    checking: "Conectando",
    syncing: "Sincronizando",
    online: "Sincronizado",
    local: "Modo local",
    error: "Falha ao sincronizar"
  };
  elements.cloudStatus.className = `cloud-status is-${state.cloudStatus}`;
  elements.cloudStatus.querySelector("strong").textContent = labels[state.cloudStatus] || labels.local;
  elements.cloudStatus.title = state.cloudMessage;
  elements.cloudStatus.querySelector("span").textContent = state.cloudMessage ? `Supabase - ${state.cloudMessage}` : "Supabase";
}

function clientFromCloud(client) {
  const name = client.name || "Cliente";
  return {
    id: client.id,
    name,
    phone: client.phone || "",
    initials: client.initials || initialsFromName(name),
    color: client.color || "#8e44ad"
  };
}

function appointmentFromCloud(item) {
  return {
    id: item.id,
    client: item.client_name || item.client || "Cliente",
    phone: item.phone || "",
    serviceId: item.service_id,
    date: item.date,
    time: String(item.time || "").slice(0, 5),
    status: item.status || "waiting",
    note: item.note || ""
  };
}

function serviceForCloud(serviceId) {
  return serviceById(serviceId);
}

async function loadBusinessFromCloud() {
  try {
    const id = cloudBusinessId();
    if (!id) return;
    const [business] = await supabaseGet(`businesses?id=eq.${id}&select=*`);
    const services = await supabaseGet(`services?business_id=eq.${id}&select=*&order=created_at.asc`);
    if (!business || !services?.length) return;

    const data = readData();
    data.business = {
      ...data.business,
      name: business.name,
      type: business.type,
      whatsapp: business.whatsapp || data.business.whatsapp,
      logo: business.logo_url || data.business.logo,
      services: services.map((service) => ({
        id: service.id,
        name: service.name,
        price: Number(service.price),
        minutes: Number(service.minutes)
      }))
    };
    try {
      const clients = await supabaseGet(`clients?business_id=eq.${id}&select=*&order=created_at.asc`);
      if (clients?.length) {
        data.clients = clients.map(clientFromCloud);
        state.selectedClient = data.clients[0].phone;
      }
    } catch (error) {
      console.warn("Nao foi possivel carregar clientes online.", error);
    }
    try {
      const appointments = await supabaseGet(`appointments?business_id=eq.${id}&select=*&order=date.asc,time.asc`);
      if (appointments?.length) {
        data.appointments = appointments.map(appointmentFromCloud);
      }
    } catch (error) {
      console.warn("Nao foi possivel carregar agendamentos online.", error);
    }
    writeData(data);
    state.cloudReady = true;
    setCloudStatus("online");
    setupForm();
    render();
  } catch (error) {
    setCloudStatus(cloudEnabled() ? "error" : "local", errorMessage(error));
    console.warn("Nao foi possivel carregar dados online.", error);
  }
}

async function saveClientToCloud(client) {
  if (!cloudEnabled()) return;
  const phone = encodeURIComponent(client.phone);
  const existing = await supabaseGet(`clients?business_id=eq.${cloudBusinessId()}&phone=eq.${phone}&select=id`);
  const body = JSON.stringify({
    business_id: cloudBusinessId(),
    name: client.name,
    phone: client.phone
  });

  if (existing?.[0]?.id) {
    await supabaseRequest(`clients?id=eq.${existing[0].id}`, { method: "PATCH", body });
    return;
  }

  await supabaseRequest("clients", { method: "POST", body });
}

async function saveAppointmentToCloud(item) {
  if (!cloudEnabled()) return;
  const service = serviceForCloud(item.serviceId);
  await supabaseRequest("appointments?on_conflict=id", {
    method: "POST",
    body: JSON.stringify({
      id: item.id,
      business_id: cloudBusinessId(),
      client_name: item.client,
      phone: item.phone,
      service_id: item.serviceId,
      service_name: service.name,
      date: item.date,
      time: item.time,
      status: item.status,
      note: item.note || ""
    }),
    headers: { Prefer: "resolution=merge-duplicates,return=representation" }
  });
}

async function updateAppointmentInCloud(item) {
  if (!cloudEnabled() || !item) return;
  const service = serviceForCloud(item.serviceId);
  await supabaseRequest(`appointments?id=eq.${item.id}`, {
    method: "PATCH",
    body: JSON.stringify({
      client_name: item.client,
      phone: item.phone,
      service_id: item.serviceId,
      service_name: service.name,
      date: item.date,
      time: item.time,
      status: item.status,
      note: item.note || ""
    })
  });
}

async function updateBusinessInCloud(business) {
  if (!cloudEnabled()) return;
  await supabaseRequest(`businesses?id=eq.${cloudBusinessId()}`, {
    method: "PATCH",
    body: JSON.stringify({
      name: business.name,
      type: business.type,
      whatsapp: business.whatsapp,
      logo_url: business.logo || null
    })
  });
}

async function updateServiceInCloud(service) {
  if (!cloudEnabled()) return;
  await supabaseRequest(`services?id=eq.${service.id}`, {
    method: "PATCH",
    body: JSON.stringify({
      name: service.name,
      price: service.price,
      minutes: service.minutes
    })
  });
}

function syncSilently(action) {
  if (!cloudEnabled()) {
    setCloudStatus("local");
    return;
  }
  setCloudStatus("syncing");
  action()
    .then(() => setCloudStatus("online"))
    .catch((error) => {
      setCloudStatus("error", errorMessage(error));
      console.warn("Nao foi possivel sincronizar com o Supabase.", error);
    });
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
  const dates = activeDates();
  const todays = data.appointments.filter((item) => dates.includes(item.date) && item.status !== "finished");
  elements.prettyDate.textContent = state.agendaFilter === "week" ? `Semana de ${formatDate(state.selectedDate)}` : formatDate(state.selectedDate);
  elements.weekday.textContent = state.agendaFilter === "week" ? "Proximos 7 dias" : formatWeekday(state.selectedDate);
  elements.agendaFilterButtons.forEach((button) => button.classList.toggle("active", button.dataset.agendaFilter === state.agendaFilter));
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
  if (state.agendaFilter === "week") {
    weekDates(state.selectedDate).forEach((date) => renderDayTimeline(data, date, true));
    return;
  }

  renderDayTimeline(data, state.selectedDate, false);
}

function renderDayTimeline(data, date, showHeader) {
  const todays = data.appointments.filter((item) => item.date === date && item.status !== "finished");
  if (showHeader) {
    const header = document.createElement("h3");
    header.className = "day-divider";
    header.textContent = `${formatWeekday(date)} - ${formatDate(date)}`;
    elements.timeline.appendChild(header);
  }

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
      pill.dataset.freeDate = date;
      pill.dataset.freeTime = hour;
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
  renderCloudStatus();
}

function updateAppointmentStatus(id, status) {
  const data = readData();
  data.appointments = data.appointments.map((item) => (item.id === id ? { ...item, status } : item));
  writeData(data);
  syncSilently(() => updateAppointmentInCloud(data.appointments.find((item) => item.id === id)));
  render();
}

function setupForm() {
  const services = readData().business.services;
  const serviceOptions = services
    .map((service) => `<option value="${service.id}">${service.name} - ${money(service.price)}</option>`)
    .join("");
  elements.serviceSelect.innerHTML = serviceOptions;
  elements.editService.innerHTML = serviceOptions;
  elements.date.value = todayIso();
  elements.date.min = todayIso();
  elements.editDate.min = todayIso();
  elements.time.value = "08:00";
}

function appointmentById(id) {
  return readData().appointments.find((item) => item.id === id);
}

function openEditAppointment(id) {
  const item = appointmentById(id);
  if (!item) return;
  state.editingAppointmentId = id;
  elements.editId.value = item.id;
  elements.editClientName.value = item.client;
  elements.editClientPhone.value = item.phone;
  elements.editService.value = item.serviceId;
  elements.editDate.value = item.date;
  elements.editTime.value = item.time;
  elements.editNote.value = item.note || "";
  openScreen("editScreen");
}

function saveEditedAppointment() {
  const data = readData();
  const id = elements.editId.value;
  const appointmentDate = elements.editDate.value;
  const appointmentTime = elements.editTime.value;

  if (!isBusinessDay(appointmentDate)) {
    window.alert("O negocio funciona de terca a sabado. Escolha uma data dentro do funcionamento.");
    return;
  }

  if (!isBusinessHour(appointmentTime)) {
    window.alert("O horario de funcionamento e das 08:00 as 18:00.");
    return;
  }

  const clientName = elements.editClientName.value.trim();
  const phone = elements.editClientPhone.value.trim();
  data.appointments = data.appointments.map((item) =>
    item.id === id
      ? {
          ...item,
          client: clientName,
          phone,
          serviceId: elements.editService.value,
          date: appointmentDate,
          time: appointmentTime,
          note: elements.editNote.value.trim()
        }
      : item
  );
  upsertClient(data, clientName, phone);
  writeData(data);
  syncSilently(async () => {
    const client = data.clients.find((item) => item.phone === phone);
    if (client) await saveClientToCloud(client);
    await updateAppointmentInCloud(data.appointments.find((item) => item.id === id));
  });
  state.selectedDate = appointmentDate;
  state.agendaFilter = "today";
  openScreen("agendaScreen");
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
  syncSilently(() => updateServiceInCloud(data.business.services.find((service) => service.id === serviceId)));
  setupForm();
  render();
}

function initialsFromName(name) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function upsertClient(data, clientName, phone) {
  const cleanPhone = phone || "(11) 99999-9999";
  const exists = data.clients.some((client) => client.phone === cleanPhone);
  if (exists) return;

  data.clients.push({
    name: clientName,
    phone: cleanPhone,
    initials: initialsFromName(clientName),
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
    const freePill = event.target.closest(".appointment-pill.free[data-free-date]");
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
      openEditAppointment(appointmentPill.dataset.id);
    }

    if (freePill) {
      elements.date.value = freePill.dataset.freeDate;
      elements.time.value = freePill.dataset.freeTime;
      openScreen("newScreen");
    }
  });

  elements.backButton.addEventListener("click", () => openScreen("agendaScreen"));
  elements.topAction.addEventListener("click", () => openScreen("newScreen"));
  elements.clientSearch.addEventListener("input", render);
  elements.prevDay.addEventListener("click", () => {
    state.selectedDate = addDays(state.selectedDate, state.agendaFilter === "week" ? -7 : -1);
    render();
  });
  elements.nextDay.addEventListener("click", () => {
    state.selectedDate = addDays(state.selectedDate, state.agendaFilter === "week" ? 7 : 1);
    render();
  });
  elements.agendaFilterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      state.agendaFilter = button.dataset.agendaFilter;
      if (state.agendaFilter === "today") state.selectedDate = todayIso();
      if (state.agendaFilter === "tomorrow") state.selectedDate = addDays(todayIso(), 1);
      render();
    });
  });

  elements.form.addEventListener("submit", (event) => {
    event.preventDefault();
    const form = new FormData(elements.form);
    const data = readData();
    const clientName = form.get("clientName").trim();
    const phone = form.get("clientPhone").trim();
    const appointmentDate = form.get("date");
    const appointmentTime = form.get("time");

    if (!isBusinessDay(appointmentDate)) {
      window.alert("O negocio funciona de terca a sabado. Escolha uma data dentro do funcionamento.");
      return;
    }

    if (!isBusinessHour(appointmentTime)) {
      window.alert("O horario de funcionamento e das 08:00 as 18:00.");
      return;
    }

    upsertClient(data, clientName, phone);
    const newAppointment = appointment(clientName, phone, form.get("service"), appointmentDate, appointmentTime, "waiting", form.get("note").trim());
    data.appointments.push(newAppointment);

    writeData(data);
    syncSilently(async () => {
      const client = data.clients.find((item) => item.phone === (phone || "(11) 99999-9999"));
      if (client) await saveClientToCloud(client);
      await saveAppointmentToCloud(newAppointment);
    });
    state.selectedDate = appointmentDate;
    state.agendaFilter = "today";
    elements.form.reset();
    setupForm();
    openScreen("agendaScreen");
  });

  elements.editForm.addEventListener("submit", (event) => {
    event.preventDefault();
    saveEditedAppointment();
  });

  elements.editCancel.addEventListener("click", () => openScreen("agendaScreen"));

  elements.editFinish.addEventListener("click", () => {
    updateAppointmentStatus(elements.editId.value, "finished");
    openScreen("agendaScreen");
  });

  elements.editDelete.addEventListener("click", () => {
    updateAppointmentStatus(elements.editId.value, "canceled");
    openScreen("agendaScreen");
  });

  elements.editWhatsapp.addEventListener("click", () => {
    const item = appointmentById(elements.editId.value);
    if (!item) return;
    const businessName = readData().business.name;
    window.open(whatsappLink(item.phone, `Ola, ${item.client}! Aqui e do ${businessName}. Podemos confirmar ou remarcar seu horario?`), "_blank", "noopener");
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
    syncSilently(() => updateBusinessInCloud(data.business));
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
loadBusinessFromCloud();
