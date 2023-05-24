import requests
import threading

s = requests.Session()

requests.get("http://localhost:3000")


def submitFlag():
    cookies = {
        "connect.sid": "s%3A2DYIpywZB5ZenpmfDrcSReMav-DiyaEE.FC8yNbH5PnHBA7Fc6uIr2oItnQ68sKB1JjDOWSq5Sv4"}
    r = requests.post("http://localhost:3001/api/user/submitFlag",
                      {"challengeId": "645659f7eca1981a33486e2b", "flag": "FLAG{HELLO}"}, cookies=cookies)
    print(r.json())


# Create two threads as follows
threads = list()
for index in range(2):
    x = threading.Thread(target=submitFlag)
    threads.append(x)
    x.start()
