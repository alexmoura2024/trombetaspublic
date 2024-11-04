import pandas as pd
import os
from unidecode import unidecode

# Caminho do arquivo Excel
file_path = "listagem.xlsx"  # Substitua pelo caminho correto do seu arquivo

# Ler o arquivo Excel
df = pd.read_excel(file_path)

# Verifique se o DataFrame foi carregado corretamente
print(df.head())  # Exibe as primeiras linhas do DataFrame

# Criação do conteúdo do arquivo TypeScript
members_content = """export interface Member {
  name: string;
  group: string;
  category: string;
  sex: string;
}

export const members: Member[] = [
"""

# Iterar sobre as linhas do DataFrame e formatar a saída
for index, row in df.iterrows():
    # Remover acentos dos valores da coluna 'name'
    name = unidecode(row['name'])
    group = row['group']
    category = row['category']
    sex = row['sex']
    
    members_content += f'  {{ name: "{name}", group: "{group}", category: "{category}", sex: "{sex}" }},\n'

# Remover a última vírgula e nova linha
members_content = members_content.rstrip(",\n") + "\n];\n\n"

# Adicionar as funções de ordenação
members_content += """export const getSortedMembers = () => {
  return [...members].sort((a, b) => a.name.localeCompare(b.name));
};

export const getSortedGroups = () => {
  return Array.from(new Set(members.map(m => m.group))).sort();
};
"""

# Criar o caminho completo para o arquivo
output_path = r"C:\Users\AlexSanderdeMoura\Dropbox\REG INTEGRADORA VRD\Site_trombetas\sb1-2bdgbr\src\data\members.ts"

# Criar o diretório se não existir
os.makedirs(os.path.dirname(output_path), exist_ok=True)

# Criar o arquivo members.ts no caminho especificado
with open(output_path, "w") as file:
    file.write(members_content)

print("Arquivo 'members.ts' criado com sucesso em:", output_path)