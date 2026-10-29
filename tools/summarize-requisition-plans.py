"""Read local Showplan XML files; no database connection or writes to the DB."""
import json
from pathlib import Path
from xml.etree import ElementTree as ET

root_dir = Path(__file__).resolve().parents[1] / 'tmp' / 'requisition-sql-audit'
ns = {'p': 'http://schemas.microsoft.com/sqlserver/2004/07/showplan'}

def untag(tag):
    return tag.split('}')[-1]

results = []
for filename in sorted(root_dir.glob('*.sqlplan')):
    root = ET.parse(filename).getroot()
    plans = []
    for qp in root.findall('.//p:QueryPlan', ns):
        operators = []
        for op in qp.findall('.//p:RelOp', ns):
            counters = op.findall('./p:RunTimeInformation/p:RunTimeCountersPerThread', ns)
            objects = [x.attrib for x in op.findall('./*/p:Object', ns)]
            predicates = [x.attrib.get('ScalarString') for x in op.findall('./*/p:Predicate/p:ScalarOperator', ns)]
            seeks = [x.attrib.get('ScalarString') for x in op.findall('./*/p:SeekPredicates//p:ScalarOperator', ns)]
            operators.append({
                'node': op.get('NodeId'), 'physical': op.get('PhysicalOp'), 'logical': op.get('LogicalOp'),
                'estimatedRows': op.get('EstimateRows'), 'estimatedRowsRead': op.get('EstimatedRowsRead'),
                'estimatedCost': op.get('EstimatedTotalSubtreeCost'),
                'actualRows': sum(float(x.get('ActualRows', 0)) for x in counters),
                'actualRowsRead': sum(float(x.get('ActualRowsRead', 0)) for x in counters),
                'executions': sum(float(x.get('ActualExecutions', 0)) for x in counters),
                'logicalReads': sum(float(x.get('ActualLogicalReads', 0)) for x in counters),
                'elapsedMs': max([float(x.get('ActualElapsedms', 0)) for x in counters] or [0]),
                'cpuMs': sum(float(x.get('ActualCPUms', 0)) for x in counters),
                'objects': objects, 'predicates': predicates, 'seeks': seeks,
                'warnings': [{ 'type': untag(x.tag), **x.attrib } for x in op.findall('./p:Warnings//*', ns)],
            })
        timing = qp.find('./p:QueryTimeStats', ns)
        memory = qp.find('./p:MemoryGrantInfo', ns)
        missing = []
        for group in qp.findall('./p:MissingIndexes/p:MissingIndexGroup', ns):
            for index in group.findall('./p:MissingIndex', ns):
                missing.append({'impact': group.get('Impact'), **index.attrib,
                    'columns': {g.get('Usage'): [x.get('Name') for x in g] for g in index}})
        plans.append({
            'attributes': qp.attrib, 'time': None if timing is None else timing.attrib,
            'memory': None if memory is None else memory.attrib,
            'waits': [x.attrib for x in qp.findall('./p:WaitStats/p:Wait', ns)],
            'missingIndexes': missing,
            'statistics': [x.attrib for x in qp.findall('./p:OptimizerStatsUsage/p:StatisticsInfo', ns)],
            'warnings': [{ 'type': untag(x.tag), **x.attrib } for x in qp.findall('./p:Warnings//*', ns)],
            'operators': operators,
        })
    results.append({'file': filename.name, 'plans': plans})
(root_dir / 'plans-summary.json').write_text(json.dumps(results, ensure_ascii=False, indent=2), encoding='utf-8')
for result in results:
    for plan in result['plans']:
        print(json.dumps({'file': result['file'], 'time': plan['time'], 'memory': plan['memory'],
            'waits': plan['waits'], 'missing': plan['missingIndexes'],
            'access': [op for op in plan['operators'] if op['objects'] or op['warnings']],
            'statistics': plan['statistics']}, ensure_ascii=False))
