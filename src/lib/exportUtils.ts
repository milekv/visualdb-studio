import type { Table, Relation, SchemaProject } from '../types/schema';

export function exportProject(tables: Table[], relations: Relation[], projectName: string): string {
  const project: SchemaProject = {
    tables,
    relations,
    name: projectName,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  return JSON.stringify(project, null, 2);
}

export function parseImport(json: string): { tables: Table[]; relations: Relation[]; name: string } | null {
  try {
    const project = JSON.parse(json) as SchemaProject;

    if (!project.tables || !Array.isArray(project.tables)) {
      return null;
    }

    return {
      tables: project.tables,
      relations: project.relations || [],
      name: project.name || 'Importowany projekt',
    };
  } catch {
    return null;
  }
}

export function downloadJSON(data: string, filename: string = 'schema.json') {
  const blob = new Blob([data], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error('Błąd odczytu pliku'));
    reader.readAsText(file);
  });
}
