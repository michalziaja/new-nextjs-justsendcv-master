export interface Application {
  id: string;
  position: string;
  company: string;
  location: string;
  status: string;
  deadline: string;
  description?: string;
}

export const mockApplications: Application[] = [
  {
    id: '1',
    position: 'Frontend Developer',
    company: 'Tech Solutions',
    location: 'Warszawa',
    status: 'Aplikowano',
    deadline: '2023-12-30',
    description: 'Poszukiwany frontend developer ze znajomością React i TypeScript.'
  },
  {
    id: '2',
    position: 'UX/UI Designer',
    company: 'Creative Studio',
    location: 'Kraków',
    status: 'Oczekuje',
    deadline: '2023-12-15',
    description: 'Projektowanie interfejsów użytkownika dla aplikacji mobilnych i webowych.'
  },
  {
    id: '3',
    position: 'Backend Developer',
    company: 'DataSystems',
    location: 'Wrocław',
    status: 'Aplikowano',
    deadline: '2024-01-10',
    description: 'Tworzenie API i mikrousług w oparciu o Node.js i Python.'
  },
  {
    id: '4',
    position: 'DevOps Engineer',
    company: 'CloudTech',
    location: 'Gdańsk',
    status: 'Zapisano',
    deadline: '2024-01-05',
    description: 'Administracja infrastrukturą w chmurze, automatyzacja procesów CI/CD.'
  },
  {
    id: '5',
    position: 'Product Manager',
    company: 'SoftwareLabs',
    location: 'Poznań',
    status: 'Zapisano',
    deadline: '2023-12-20',
    description: 'Zarządzanie produktem cyfrowym, współpraca z developerami i designerami.'
  }
]; 