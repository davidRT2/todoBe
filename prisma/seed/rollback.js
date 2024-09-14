import db from '#helper/db.mjs';

async function rollback() {
  console.log('Start rollback ...');

  try {
    // Delete all ToDos
    await db.toDo.deleteMany({});
    console.log('ToDos deleted');

    // Delete all Tags
    await db.tag.deleteMany({});
    console.log('Tags deleted');

    // Delete all UserRoles
    await db.userRole.deleteMany({});
    console.log('UserRoles deleted');

    // Delete all Users
    await db.user.deleteMany({});
    console.log('Users deleted');

    // Delete all Roles
    await db.role.deleteMany({});
    console.log('Roles deleted');

    console.log('Rollback completed.');
  } catch (error) {
    console.error('Error during rollback:', error);
  } finally {
    await db.$disconnect();
  }
}

rollback()
  .catch((e) => {
    console.error('Rollback failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
