import numpy as np
from scipy.interpolate import griddata
import json

# 输入数据
data = [
    {"x":117.224793, "y":31.826156, "z":146.9, "value":10},
    {"x":117.225075, "y":31.826087, "z":146.7, "value":20},
    {"x":117.224762, "y":31.826164, "z":126.4, "value":40},
    {"x":117.22503, "y":31.826097, "z":122.1, "value":10},
    {"x":117.224726, "y":31.826172, "z":76.4, "value":50},
    {"x":117.225057, "y":31.826091, "z":73.7, "value":30},
    {"x":117.225231, "y":31.826224, "z":139.5, "value":60},
    {"x":117.225226, "y":31.826208, "z":111.9, "value":70},
    {"x":117.225282, "y":31.826299, "z":52, "value":20},
    {"x":117.225176, "y":31.826403, "z":147.1, "value":10},
    {"x":117.22491, "y":31.826468, "z":137.1, "value":100},
    {"x":117.225166, "y":31.826406, "z":120.9, "value":30},
    {"x":117.224881, "y":31.826476, "z":108, "value":40},
    {"x":117.225204, "y":31.826396, "z":72.2, "value":60},
    {"x":117.224856, "y":31.826482, "z":67.6, "value":90}
]

# 提取坐标和值
points = np.array([(d['x'], d['y'], d['z']) for d in data])
values = np.array([d['value'] for d in data])

# 创建网格
x_min, x_max = points[:, 0].min(), points[:, 0].max()
y_min, y_max = points[:, 1].min(), points[:, 1].max()
z_min, z_max = points[:, 2].min(), points[:, 2].max()

# 生成网格点 - 增加网格密度以获得更精细的点云
grid_x, grid_y, grid_z = np.mgrid[
    x_min:x_max:30j, 
    y_min:y_max:30j, 
    z_min:z_max:30j
]

# 进行三维插值
grid_values = griddata(
    points, 
    values, 
    (grid_x, grid_y, grid_z), 
    method='linear', 
    fill_value=np.nan  # 对于超出凸包的区域填充NaN
)

# 提取所有有效点（非NaN值）
valid_mask = ~np.isnan(grid_values)
interpolated_points = {
    "x": grid_x[valid_mask].tolist(),
    "y": grid_y[valid_mask].tolist(),
    "z": grid_z[valid_mask].tolist(),
    "values": grid_values[valid_mask].tolist()
}

# 保存插值点云到JSON文件
with open('interpolated_point_cloud.json', 'w') as f:
    json.dump(interpolated_points, f, indent=2)

print("插值点云已保存到 interpolated_point_cloud.json")

# 创建可视化图形（可选）
import matplotlib.pyplot as plt
from mpl_toolkits.mplot3d import Axes3D
from matplotlib import cm

fig = plt.figure(figsize=(10, 8))
ax = fig.add_subplot(111, projection='3d')

# 绘制原始点
scatter1 = ax.scatter(points[:, 0], points[:, 1], points[:, 2], 
                     c=values, cmap=cm.viridis, s=50, label='Original Points')

# 绘制插值点云（采样部分点以避免过于密集）
sample_mask = np.random.choice(len(interpolated_points["x"]), 
                              min(1000, len(interpolated_points["x"])), 
                              replace=False)
sampled_x = [interpolated_points["x"][i] for i in sample_mask]
sampled_y = [interpolated_points["y"][i] for i in sample_mask]
sampled_z = [interpolated_points["z"][i] for i in sample_mask]
sampled_values = [interpolated_points["values"][i] for i in sample_mask]

scatter2 = ax.scatter(sampled_x, sampled_y, sampled_z, 
                     c=sampled_values, cmap=cm.viridis, s=10, alpha=0.5, 
                     label='Interpolated Points')

ax.set_xlabel('X')
ax.set_ylabel('Y')
ax.set_zlabel('Z')
ax.set_title('Original and Interpolated Points')
ax.legend()

plt.colorbar(scatter1, ax=ax, shrink=0.5, aspect=5)
plt.savefig('point_cloud_visualization.png', dpi=300, bbox_inches='tight')
plt.show()

print("可视化结果已保存到 point_cloud_visualization.png")

# 返回JSON数据
print("\n插值点云JSON数据结构:")
print(f"点数: {len(interpolated_points['x'])}")
print(f"X范围: [{min(interpolated_points['x']):.6f}, {max(interpolated_points['x']):.6f}]")
print(f"Y范围: [{min(interpolated_points['y']):.6f}, {max(interpolated_points['y']):.6f}]")
print(f"Z范围: [{min(interpolated_points['z']):.6f}, {max(interpolated_points['z']):.6f}]")
print(f"值范围: [{min(interpolated_points['values']):.2f}, {max(interpolated_points['values']):.2f}]")

# 如果您需要直接使用这个JSON数据，可以这样访问:
# interpolated_points["x"] - 所有点的X坐标列表
# interpolated_points["y"] - 所有点的Y坐标列表
# interpolated_points["z"] - 所有点的Z坐标列表
# interpolated_points["values"] - 所有点的值列表