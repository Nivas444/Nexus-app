with open(r'e:\Freelance\frontend\home.html', 'r', encoding='utf-8') as f:
    text = f.read()

for card in ['addMaterialsCard', 'addProductExpenseCard', 'addProductInfraCard']:
    start = text.find(f'id="{card}"')
    end = text.find('</form>', start) + 7
    print(f'*** CARD: {card} ***')
    print(text[start:end])
    print('\n' + '='*50 + '\n')
