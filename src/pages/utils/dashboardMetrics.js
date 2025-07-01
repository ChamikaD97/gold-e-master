

export function getTotalLeaf(data, range = "today") {
  const now = new Date();
  return data
    .filter(d => {
      const date = new Date(d.date);
      if (range === "today") return date.toDateString() === now.toDateString();
      if (range === "week") {
        const weekAgo = new Date(now); weekAgo.setDate(now.getDate() - 7);
        return date >= weekAgo && date <= now;
      }
      if (range === "month") return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
    })
    .reduce((sum, d) => sum + parseFloat(d.net_kg || 0), 0);
}

export function getMonthlyAchievementsForSupplier(data, supplierId) {
  if (!Array.isArray(data) || !supplierId) return [];

  const grouped = {};

  data
    .filter(entry => entry.supplier_id === supplierId)
    .forEach(entry => {
      const { date, net_kg } = entry;
      if (!date || net_kg == null) return;

      const month = new Date(date).toISOString().slice(0, 7); // "YYYY-MM"

      if (!grouped[month]) {
        grouped[month] = {
          total: 0,
          data: []
        };
      }

      grouped[month].total += parseFloat(net_kg);
      grouped[month].data.push(entry);
    });

  // Convert grouped object to array for table/chart use
  const result = Object.entries(grouped).map(([month, { total, data }]) => ({
    month,
    total: parseFloat(total.toFixed(2)),
    data
  }));
  console.log(result); // 👈 Debugging line to check the output

  return result;
}
// export function getSupplierSummaryByDateRange(data, supplierId, startDate, endDate) {
//   if (!Array.isArray(data) || !supplierId || !startDate || !endDate) return null;

//   const start = new Date(startDate);
//   const end = new Date(endDate);
//   console.log(startDate, endDate); // 👈 Debugging line to check the output
//   console.log(data); // 👈 Debugging line to check the output
//   console.log(supplierId); // 👈 Debugging line to check the output



//   const filtered = data.filter(entry => {
//     return (
//       entry.supplier_id === supplierId &&
//       new Date(entry.date) >= start && new Date(entry.date) <= end
//     );
//   });

//   // Initialize totals
//   let superTotal = 0;
//   let normalTotal = 0;

//   filtered.forEach(entry => {
//     const { leaf_type, net_kg } = entry;
//     const amount = parseFloat(net_kg || 0);

//     if (leaf_type === "Super") {
//       superTotal += amount;
//     } else if (leaf_type === "Normal") {
//       normalTotal += amount;
//     }
//   });


//   const res = {
//     filteredData: filtered,
//     superLeafTotalNetKg: parseFloat(superTotal.toFixed(2)),
//     normalLeafTotalNetKg: parseFloat(normalTotal.toFixed(2))
//   }

//   return res;
// }


export function getPreviousMonthSummaryByOfficer(data) {
  if (!data || data.length === 0) return [];

  // ✅ Get previous calendar month as 'YYYY-MM'
  const now = new Date();
  const year = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear();
  const month = now.getMonth() === 0 ? 12 : now.getMonth(); // Jan = 0, so prev month = 12
  const previousMonth = `${year}-${month.toString().padStart(2, '0')}`;



  // Filter data for the exact previous month
  const lastMonthData = data.filter(d => d.month === previousMonth);

  // Group by officer
  const grouped = {};
  lastMonthData.forEach(({ field_officer, target, achieved }) => {
    if (!grouped[field_officer]) {
      grouped[field_officer] = { target: 0, achieved: 0 };
    }
    grouped[field_officer].target += target;
    grouped[field_officer].achieved += achieved;
  });

  // Return structured summary
  return Object.entries(grouped).map(([officer, { target, achieved }]) => ({
    officer,
    month: previousMonth,
    target,
    achieved,
    progress: target > 0 ? parseFloat(((achieved / target) * 100).toFixed(2)) : 0
  }));
}



export function getLatestAchievementByOfficerFromSupplierData(data, lineToOfficer, targetsByOfficer) {
  const grouped = {};

  data.forEach(({ date, net_kg, line }) => {
    const officer = lineToOfficer[line];
    if (!officer) return;

    const month = date.slice(0, 7);

    const key = `${officer}_${month}`;
    if (!grouped[key]) {
      grouped[key] = {
        officer,
        month,
        achieved: 0
      };
    }

    grouped[key].achieved += net_kg;
  });

  const latestMonth = Object.values(grouped)
    .map(r => r.month)
    .sort((a, b) => new Date(b) - new Date(a))[0];

  const result = Object.values(grouped)
    .filter(r => r.month === latestMonth)
    .map(r => {
      const target = targetsByOfficer[r.officer] || 0;
      const achievementPercent = target > 0 ? (r.achieved / target) * 100 : 0;
      return {
        ...r,
        target,
        achievementPercent: parseFloat(achievementPercent.toFixed(2))
      };
    });

  return result;
}

export function calculateProgress(target, actual) {
  return Math.min((actual / target) * 100, 100);
}

export function getLineWiseTotals(data) {
  const result = {};
  data.forEach(({ line, net_kg }) => {
    result[line] = (result[line] || 0) + parseFloat(net_kg || 0);
  });
  return result;
}
export function getTotalNetKgByLeafType(data) {
  const totals = {};

  data.forEach(({ leaf_type, net_kg }) => {
    if (!totals[leaf_type]) totals[leaf_type] = 0;
    totals[leaf_type] += net_kg;
  });

  // Round to 2 decimals
  for (let key in totals) {
    totals[key] = parseFloat(totals[key].toFixed(2));
  }

  return totals;
}



export function getMonthlyAchievementPercentagesByOfficer(data) {
  const result = {};

  data.forEach(({ month, field_officer, target, achieved }) => {
    const achievementPercent = target > 0 ? (achieved / target) * 100 : 0;
    const entry = {
      month,
      target,
      achieved,
      achievementPercent: parseFloat(achievementPercent.toFixed(2)),
    };

    if (!result[field_officer]) {
      result[field_officer] = [];
    }

    result[field_officer].push(entry);
  });

  return result;
}

export function getLeafTypeRatio(data) {
  const stats = { Super: 0, Normal: 0 };
  data.forEach(({ leaf_type, net_kg }) => {
    if (stats[leaf_type] !== undefined) stats[leaf_type] += parseFloat(net_kg || 0);
  });
  return stats;
}

export function getTopSuppliers(data, top = 5) {
  const now = new Date();
  const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const supplierTotals = {};

  data.forEach(({ supplier_id, net_kg, date, line }) => {
    const recordDate = new Date(date);
    if (recordDate >= lastMonth && recordDate < thisMonth) {
      if (!supplierTotals[supplier_id]) {
        supplierTotals[supplier_id] = {
          total: 0,
          lines: new Set()
        };
      }
      supplierTotals[supplier_id].total += parseFloat(net_kg || 0);
      if (line) supplierTotals[supplier_id].lines.add(line);
    }
  });

  const result = Object.entries(supplierTotals)
    .sort((a, b) => b[1].total - a[1].total)
    .slice(0, top)
    .map(([supplier_id, { total, lines }]) => ({
      supplier_id,
      total,
      line: Array.from(lines)[0]
    }));
  console.log(result); // 👈 Debugging line to check the output

  return result; // 👈 returns an actual JSON array
}

export function getInactiveSuppliers(data, threshold = 6) {
  const today = new Date();
  const lastSeen = {};
  data.forEach(({ supplier_id, date }) => {
    const d = new Date(date);
    if (!lastSeen[supplier_id] || d > lastSeen[supplier_id]) {
      lastSeen[supplier_id] = d;
    }
  });
  return Object.entries(lastSeen)
    .filter(([_, lastDate]) => {
      const diff = Math.floor((today - lastDate) / (1000 * 60 * 60 * 24));
      return diff > threshold;
    })
    .map(([id]) => id);
}

export function getSuppliersMarkedXOnDate(data, notificationDate, leafRound, officerLineMap) {
  const targetDate = new Date();
  targetDate.setDate(targetDate.getDate() + notificationDate);
  const formatDate = date => date.toISOString().split('T')[0];
  const targetDateStr = formatDate(targetDate);

  const supplierMap = {};

  data.forEach(item => {
    if (!supplierMap[item.supplier_id]) {
      supplierMap[item.supplier_id] = [];
    }
    supplierMap[item.supplier_id].push(item);
  });

  const result = {};

  for (const supplierId in supplierMap) {
    const records = supplierMap[supplierId];
    const lastDate = new Date(Math.max(...records.map(r => new Date(r.date))));
    const nextDate = new Date(lastDate);
    nextDate.setDate(nextDate.getDate() + leafRound);

    if (formatDate(nextDate) === targetDateStr) {
      const latestRecord = records.find(r => formatDate(new Date(r.date)) === formatDate(lastDate));
      const line = latestRecord?.line || "Unknown";

      // Find officer for the line
      const officer = Object.keys(officerLineMap).find(name =>
        officerLineMap[name].includes(line)
      ) || "Unassigned";

      if (!result[officer]) {
        result[officer] = [];
      }

      result[officer].push({
        supplierId,
        line
      });
    }
  }
  console.log(result); // 👈 Debugging line to check the output

  return result;
}



export function getNewSuppliersThisMonth(data) {
  const thisMonth = new Date().toISOString().slice(0, 7);
  const seen = new Set();
  return data.filter(({ supplier_id, date }) => {
    if (!seen.has(supplier_id) && date.startsWith(thisMonth)) {
      seen.add(supplier_id);
      return true;
    }
    return false;
  }).map(d => d.supplier_id);
}
