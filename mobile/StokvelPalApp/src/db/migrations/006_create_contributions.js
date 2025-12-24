export async function up(knex) {
  await knex.schema.createTable("contributions", (table) => {
    table.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));

    table.uuid("group_id").notNullable();
    table.uuid("user_id").notNullable();

    table.decimal("amount", 12, 2).notNullable();
    table.timestamp("paid_at").notNullable().defaultTo(knex.fn.now());
    table.text("note").nullable();

    table.timestamp("created_at").notNullable().defaultTo(knex.fn.now());

    table.foreign("group_id").references("groups.id").onDelete("CASCADE");
    table.foreign("user_id").references("users.id").onDelete("CASCADE");

    table.index(["group_id"]);
    table.index(["user_id"]);
    table.index(["group_id", "paid_at"]);
  });
}

export async function down(knex) {
  await knex.schema.dropTableIfExists("contributions");
}
