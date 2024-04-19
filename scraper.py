from os import error
from selenium_driverless import webdriver
from selenium_driverless.types.by import By
import asyncio
import sys
import json
import time
import random
from pathlib import Path

async def main(course: str, id: str):
    options = webdriver.ChromeOptions()
    async with webdriver.Chrome(options=options) as driver:
        await driver.get('https://enroll.dlsu.edu.ph/dlsu/view_course_offerings?p_course_code='+course+'&p_option=all&p_button=Search&p_id_no='+id+'&p_button=Search')
        await driver.sleep(0.5)
        # await driver.wait_for_cdp("Page.domContentEventFired", timeout=15)
        
        await driver.sleep(0.5)
        # what the fuck is this coding style la salle
        elem = await driver.find_element(By.XPATH, '/html/body/table[4]/tbody/tr/td/table/tbody/tr[3]/td/table/tbody/tr/td[2]/form/table', timeout=10)
        print("FOUND ELEM");
        content = str(await elem.text).replace('\xa0\xa0', '').split("\n")
        path = Path('raw/'+course.lower()+'.json');
        path.touch(exist_ok=True)
        with open(path, 'w+') as f:
            f.write(json.dumps(content))

for i in range(1, len(sys.argv)):
    asyncio.run(main(sys.argv[i], '12308293'))
    print("SUCCESS: " + sys.argv[i])
    time.sleep(random.randint(2, 5))

