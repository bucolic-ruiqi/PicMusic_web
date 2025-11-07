import pandas as pd
import os

# 1) 输入/输出路径
csv_file = '../database/dataset_test.csv'
sql_file = '../database/dataset_test.sql'
table_name = 'songs'

# 2) 建表语句
create_table_sql = f"""
CREATE TABLE IF NOT EXISTS {table_name} (
    ID VARCHAR(64) PRIMARY KEY,
    name VARCHAR(255),
    artist VARCHAR(255),
    style TEXT,
    language VARCHAR(64),
    BPM INT,
    instrument TEXT,
    lyrics TEXT,
    label VARCHAR(128),
    emotion_json JSON,
    dominant_emotion VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
"""

# 3) 读取 CSV
df = pd.read_csv(csv_file)

# 4) SQL 转义
def sql_escape(val):
    if pd.isna(val):
        return "NULL"
    elif isinstance(val, (int, float)):
        return str(val)
    else:
        # 将单引号 ' 替换为两个单引号 ''
        escaped_val = str(val).replace("'", "''")
        return f"'{escaped_val}'"

# 5) 构造 INSERT 语句
sql_lines = []

# 首次写入时追加 CREATE TABLE
if not os.path.exists(sql_file):
    sql_lines.append(create_table_sql.strip() + "\n")

# 遍历构造 INSERT
for _, row in df.iterrows():
    columns = ', '.join(df.columns)
    values = [sql_escape(row[col]) for col in df.columns]
    values_str = ', '.join(values)
    insert_sql = f"INSERT INTO {table_name} ({columns}) VALUES ({values_str});"
    sql_lines.append(insert_sql)

# 6) 追加到 SQL 文件
with open(sql_file, 'a', encoding='utf-8') as f:
    f.write('\n'.join(sql_lines))
    f.write('\n')  # 最后添加一个换行

print(f"✅ 已更新 SQL（追加模式）：{sql_file}")
