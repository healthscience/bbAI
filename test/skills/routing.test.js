import { describe, it, expect, vi } from 'vitest';

// Mocks must be at the top level and can't use variables defined outside the factory unless they start with 'vi'
vi.mock('../src/beebeeAgent/beebeeLearn.js', () => ({ 
  default: class { constructor() { this.on = vi.fn(); this.initialize = vi.fn(); this.handleBentoBoxMessage = vi.fn(); } } 
}));

vi.mock('../src/agents/networkAgents.js', () => ({ 
  default: class { constructor() { this.setHopLearn = vi.fn(); this.hopLearn = {}; } } 
}));

vi.mock('../../src/context/contextHelper.js', () => ({ 
  default: class { constructor() { this.setHopLearn = vi.fn(); this.inputLanuage = vi.fn().mockResolvedValue({ bentobox: true, data: { sequence: { data: {} }, compute: [{ compute: {} }] } }); } } 
}));

vi.mock('../src/data/blindData.js', () => ({ default: class {} }));
vi.mock('../src/besearch/index.js', () => ({ default: class { constructor() { this.on = vi.fn(); this.listenOracles = vi.fn(); } } }));
vi.mock('hop-query-builder', () => ({ default: class { constructor() { this.queryPath = vi.fn(); } } }));
vi.mock('hop-dml', () => ({ default: class {} }));

vi.mock('../src/brain/altruismHandler.js', () => ({ altruismHandler: {} }));
vi.mock('../src/brain/catalystProfiles.js', () => ({ catalystProfiles: {} }));
vi.mock('../src/brain/metabolicValve.js', () => ({ metabolicValve: {} }));
vi.mock('../src/brain/metobolicGovernor.js', () => ({ metobolicGovernor: {} }));
vi.mock('../src/brain/patterAgent.js', () => ({ patterAgent: {} }));
vi.mock('../src/brain/trinityManager.js', () => ({ TrinityManager: { ignite: vi.fn().mockResolvedValue({ physics: {} }) } }));

vi.mock('../src/skills/RDFmapper.js', () => ({ RDFNavigator: { fetchDBpediaLayer: vi.fn().mockResolvedValue({ label: ['heart'] }) } }));
vi.mock('../src/skills/dataMapper.js', () => ({ DataMapper: {} }));
vi.mock('../src/skills/lexiconHarvester.js', () => ({ LexiconHarvester: {} }));
vi.mock('../src/skills/networkQuery.js', () => ({ networkQuery: {} }));
vi.mock('../src/skills/teach.js', () => ({ teach: {} }));

import BbAI from '../../../src/index.js';
import { TrinityManager } from '../../../src/brain/trinityManager.js';
import { RDFNavigator } from '../../../src/skills/RDFmapper.js';

describe('BbAI Routing', () => {
  const mockContext = {
    network: {},
    besearch: {},
    heliclock: {}
  };

  it('should expose brain and skills in the constructor', () => {
    const bbai = new BbAI(mockContext);
    expect(bbai.brain).toBeDefined();
    expect(bbai.skills).toBeDefined();
    expect(bbai.skills.rdfNavigator).toBeDefined();
    expect(bbai.brain.trinityManager).toBeDefined();
  });

  it('should route "skill: rdf" messages via beebeeFlow to handleSkillRequest', async () => {
    const bbai = new BbAI(mockContext);
    const spy = vi.spyOn(bbai, 'handleSkillRequest').mockResolvedValue();
    
    const inFlow = {
      bbid: 'test-bbox',
      data: {
        content: 'I want to use skill: rdf with https://dbpedia.org/data/Heart.ttl',
        tools: [],
        session: false
      }
    };

    await bbai.beebeeFlow(inFlow);
    
    expect(spy).toHaveBeenCalledWith(expect.objectContaining({
      skill: 'rdf',
      params: expect.objectContaining({
        rdfUrl: 'https://dbpedia.org/data/Heart.ttl'
      })
    }));
  });

  it('should route skill results to TrinityManager and emit response', async () => {
    const bbai = new BbAI(mockContext);
    const emitSpy = vi.spyOn(bbai, 'emit');
    
    const skillMessage = {
      skill: 'rdf',
      params: { rdfUrl: 'https://dbpedia.org/data/Heart.ttl' },
      bbid: 'test-bbox'
    };

    await bbai.handleSkillRequest(skillMessage);
    
    expect(RDFNavigator.fetchDBpediaLayer).toHaveBeenCalled();
    expect(TrinityManager.ignite).toHaveBeenCalled();
    expect(emitSpy).toHaveBeenCalledWith('beebee-response', expect.objectContaining({
      action: 'skill-complete',
      task: 'rdf-extraction',
      bbid: 'test-bbox'
    }));
  });
});
