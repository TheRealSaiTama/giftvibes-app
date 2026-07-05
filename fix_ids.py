import os

def replace_in_file(filepath, old_text, new_text):
    with open(filepath, 'r') as f:
        content = f.read()
    if old_text in content:
        content = content.replace(old_text, new_text)
        with open(filepath, 'w') as f:
            f.write(content)
        print(f"Updated {filepath}")

search_dir = '/home/therealsaitama/giftvibes-ultimate/apps/storefront/src'

for root, _, files in os.walk(search_dir):
    for file in files:
        if file.endswith(('.ts', '.tsx')):
            filepath = os.path.join(root, file)
            replace_in_file(filepath, 'id: number;', 'id: string | number;')
            replace_in_file(filepath, '(id: number)', '(id: string | number)')
            replace_in_file(filepath, 'currentId: number', 'currentId: string | number')
