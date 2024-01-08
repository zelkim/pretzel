from contextlib import nullcontext
from sre_constants import ANY_ALL


with open('content.txt', 'r') as f:
    content = f.read()
    res = content.strip('[]').replace("'", "").split(', ')

    for i in res:
        if i == '' or i == ' ' or i == nullcontext:
            res.remove(i)
 
    for i in range(13): res.pop(i);
    
    newlist = []
    current_listitem = [];
    
    for i in res:
        if i.isnumeric() and int(i) > 999:
            
            newlist.append(current_listitem)
            current_listitem.clear()
    
        current_listitem.append(i)

    print(newlist)
