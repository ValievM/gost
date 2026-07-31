import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { createPlantUmlGost, ER } from "../../dist/plantuml-gost.js";

const plantUml = createPlantUmlGost({ dpi: 150 });
const HERE = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(HERE, "out");

fs.mkdirSync(OUT, { recursive: true });

async function save(name, builder) {
  const png = await plantUml.render(builder.build());
  fs.writeFileSync(path.join(OUT, `${name}.png`), png);
  console.log(`✓ ${name}.png`);
}

const useCase = plantUml.useCaseDiagram()
  .actor("Пользователь", "USER")
  .actor("Администратор", "ADMIN")
  .package("Система заказов", (b) => {
    b.usecase("Войти в систему", "LOGIN");
    b.usecase("Оформить заказ", "ORDER");
    b.usecase("Проверить оплату", "PAYMENT");
    b.usecase("Управлять каталогом", "CATALOG");
  })
  .arrow("USER", "LOGIN")
  .arrow("USER", "ORDER")
  .arrow("ADMIN", "CATALOG")
  .include("ORDER", "PAYMENT")
  .extend("LOGIN", "CATALOG");

const classDiagram = plantUml.classDiagram()
  .abstract("Entity", ["+ id: number", "+ createdAt: Date"])
  .interface("Repository", ["+ save(entity): void", "+ findById(id): Entity"])
  .class("User", ["+ name: string", "+ email: string"])
  .class("Order", ["+ total: decimal", "+ pay(): void"])
  .class("OrderItem", ["+ quantity: number", "+ price: decimal"])
  .enum("OrderStatus", ["NEW", "PAID", "CANCELLED"])
  .extends("User", "Entity")
  .extends("Order", "Entity")
  .implements("User", "Repository")
  .composition("Order", "OrderItem", "содержит")
  .association("Order", "User", "принадлежит")
  .dependency("Order", "OrderStatus", "имеет статус");

const sequence = plantUml.sequenceDiagram()
  .actor("Пользователь", "USER")
  .participant("Веб-приложение", "WEB")
  .participant("API", "API")
  .participant("База данных", "DB")
  .divider("Оформление заказа")
  .arrow("USER", "WEB", "Подтвердить заказ")
  .arrow("WEB", "API", "POST /orders")
  .activate("API")
  .group("Транзакция", (b) => {
    b.arrow("API", "DB", "INSERT order");
    b.return("DB", "API", "order_id");
  })
  .note("Проверка итоговой суммы", "right", "API")
  .return("API", "WEB", "201 Created")
  .deactivate("API")
  .return("WEB", "USER", "Заказ создан");

const state = plantUml.stateDiagram()
  .state("NEW", "Новый")
  .state("PAID", "Оплачен")
  .state("SHIPPED", "Отправлен")
  .state("CANCELLED", "Отменён")
  .initial("NEW")
  .transition("NEW", "PAID", "оплата")
  .transition("NEW", "CANCELLED", "отмена")
  .transition("PAID", "SHIPPED", "передача в доставку")
  .final("SHIPPED")
  .final("CANCELLED");

const activity = plantUml.activityDiagram()
  .start()
  .partition("Клиент", (b) => b.action("Отправить заказ"))
  .partition("Сервер", (b) => {
    b.action("Проверить данные")
      .if(
        "Данные корректны",
        (yes) => yes.action("Сохранить заказ"),
        (no) => no.action("Вернуть ошибку"),
        "да",
        "нет",
      );
  })
  .fork(
    (b) => b.action("Отправить уведомление"),
    (b) => b.action("Записать аудит"),
  )
  .stop();

const component = plantUml.componentDiagram()
  .package("Клиент", (b) => b.component("Browser", "BROWSER"))
  .package("Сервер", (b) => {
    b.component("REST API", "API");
    b.component("Auth Service", "AUTH");
    b.database("PostgreSQL", "DB");
  })
  .interface("OAuth", "OAUTH")
  .cloud("Провайдер идентификации", "IDP")
  .arrow("BROWSER", "API", "HTTPS")
  .arrow("API", "AUTH", "проверка токена")
  .arrow("API", "DB", "SQL")
  .link("AUTH", "OAUTH")
  .arrow("OAUTH", "IDP", "OAuth 2.0");

const deployment = plantUml.deploymentDiagram()
  .node("Клиент", "CLIENT", (b) => b.component("Web App", "WEB"))
  .node("Сервер приложений", "APP", (b) => {
    b.component("Node.js API", "API");
    b.artifact("server.js", "SERVER_JS");
  })
  .node("Сервер БД", "DB_NODE", (b) => b.database("PostgreSQL", "DB"))
  .cloud("CDN", (b) => b.artifact("static files", "STATIC"))
  .arrow("CLIENT", "APP", "HTTPS :443")
  .arrow("APP", "DB_NODE", "TCP :5432");

const object = plantUml.objectDiagram()
  .object("order1 : Order", "ORDER", { id: 1001, status: '"PAID"', total: 12500 })
  .object("user1 : User", "USER", { id: 42, name: '"Иванов"' })
  .object("item1 : OrderItem", "ITEM", { quantity: 2, price: 6250 })
  .link("USER", "ORDER", "оформил")
  .link("ORDER", "ITEM", "содержит");

const er = plantUml.erDiagram()
  .entity("User", ["id : int <<PK>>"], ["name : varchar(100)", "email : varchar(100)"])
  .entity("Order", ["id : int <<PK>>"], ["user_id : int <<FK>>", "total : decimal"])
  .entity("Product", ["id : int <<PK>>"], ["name : varchar(200)", "price : decimal"])
  .entity(
    "OrderItem",
    ["order_id : int <<FK>>", "product_id : int <<FK>>"],
    ["quantity : int", "price : decimal"],
  )
  .relation("User", ER.ONE_TO_MANY, "Order", "оформляет")
  .relation("Order", ER.ONE_TO_MANY_REQ, "OrderItem", "содержит")
  .relation("Product", ER.ONE_TO_MANY, "OrderItem", "входит в");

const timing = plantUml.timingDiagram()
  .concise("Клиент", "CLIENT")
  .robust("Сервер", "SERVER")
  .clock("Тактовый сигнал", 100)
  .at(0)
  .state("CLIENT", "Idle")
  .state("SERVER", "Listening")
  .at(50)
  .state("CLIENT", "Waiting")
  .arrow("CLIENT", "SERVER", "HTTP GET /orders")
  .at(150)
  .state("SERVER", "Processing")
  .at(250)
  .state("SERVER", "Listening")
  .state("CLIENT", "Active")
  .arrow("SERVER", "CLIENT", "200 OK");

const mindMap = plantUml.mindMap()
  .node(1, "Архитектура приложения")
  .node(2, "Клиент")
  .node(3, "Интерфейс")
  .node(3, "Состояние")
  .node(2, "Сервер")
  .node(3, "API")
  .node(3, "Бизнес-логика")
  .node(2, "Данные", "left")
  .node(3, "PostgreSQL", "left")
  .node(3, "Redis", "left");

const gantt = plantUml.ganttChart()
  .startDate("2026-09-01")
  .section("Подготовка")
  .task("Анализ требований", 5)
  .after("Проектирование", "Анализ требований", 4)
  .section("Разработка")
  .after("Backend", "Проектирование", 10)
  .after("Frontend", "Backend", 8)
  .section("Завершение")
  .after("Тестирование", "Frontend", 5)
  .milestone("Релиз", "Тестирование");

const diagrams = [
  ["01-use-case", useCase],
  ["02-class", classDiagram],
  ["03-sequence", sequence],
  ["04-state", state],
  ["05-activity", activity],
  ["06-component", component],
  ["07-deployment", deployment],
  ["08-object", object],
  ["09-er", er],
  ["10-timing", timing],
  ["11-mindmap", mindMap],
  ["12-gantt", gantt],
];

for (const [name, builder] of diagrams) {
  await save(name, builder);
}

console.log(`\nГотово → ${OUT}`);
