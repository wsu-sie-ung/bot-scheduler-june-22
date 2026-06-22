
import db from './src/models';

async function inspectTables() {
  try {
    console.log('--- Inspecting v_subsales ---');
    const [subsaleCols] = await db.sequelize.query('DESCRIBE v_subsales');
    const subsaleFields = subsaleCols.map(c => c.Field);
    console.log('Fields in v_subsales:', subsaleFields.filter(f => f.includes('type')));

    console.log('--- Inspecting v_project_types ---');
    const [ptCols] = await db.sequelize.query('DESCRIBE v_project_types');
    console.table(ptCols);

  } catch (error) {
    console.error('Inspection failed:', error);
  } finally {
    await db.sequelize.close();
  }
}

inspectTables();
