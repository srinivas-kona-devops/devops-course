#!/usr/bin/env python3
"""Insert extra SVG diagrams into course/_src pages. Idempotent (each figure carries a dg:ID marker)."""
import pathlib

SRC = pathlib.Path(__file__).parent / '_src'
P = dict(blue='#6c8cff', teal='#2dd4bf', amber='#f59e0b', pink='#f472b6',
         violet='#a78bfa', green='#34d399', red='#f87171', slate='#475085')
DARK = {'teal', 'amber', 'green'}
CYCLE = ['blue', 'violet', 'pink', 'amber', 'teal', 'green']
DEFS = ('<defs><marker id="ar" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">'
        '<path d="M0,0 L8,4 L0,8z" fill="#9aa3c7"/></marker></defs>')


def esc(s):
    return s.replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;')


def text(x, y, t, fs=12, anchor='middle', cls='lb', extra=''):
    return f'<text x="{x}" y="{y}" font-size="{fs}" text-anchor="{anchor}" class="{cls}" {extra}>{esc(t)}</text>'


def box(x, y, w, h, t, c='blue', fs=13):
    col = P.get(c, c)
    tc = '#0a0d1a' if c in DARK else '#fff'
    ls = t.split('\n')
    y0 = y + h / 2 - (len(ls) - 1) * fs * 0.6 + fs * 0.35
    tx = ''.join(f'<tspan x="{x + w / 2}" y="{y0 + i * fs * 1.2:.1f}">{esc(l)}</tspan>' for i, l in enumerate(ls))
    return (f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="8" fill="{col}"/>'
            f'<text font-size="{fs}" fill="{tc}" text-anchor="middle">{tx}</text>')


def arrow(x1, y1, x2, y2, label='', dash=False, dy=-6):
    d = ' stroke-dasharray="5"' if dash else ''
    s = f'<line x1="{x1}" y1="{y1}" x2="{x2}" y2="{y2}" stroke="#9aa3c7" stroke-width="2"{d} marker-end="url(#ar)"/>'
    if label:
        s += text((x1 + x2) / 2, (y1 + y2) / 2 + dy, label, 11)
    return s


def group(x, y, w, h, title, c='blue'):
    return (f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="12" fill="none" stroke="{P.get(c, c)}" '
            f'stroke-width="2" stroke-dasharray="6"/>'
            f'<text x="{x + 12}" y="{y + 18}" font-size="13" fill="{P.get(c, c)}">{esc(title)}</text>')


def fig(w, h, body, cap, label, dg):
    return (f'<!--dg:{dg}--><figure><svg viewBox="0 0 {w} {h}" width="{w}" role="img" aria-label="{esc(label)}">'
            f'{DEFS}{body}</svg><figcaption>{esc(cap)}</figcaption></figure>')


def flow(items, bw=100, gap=24, bh=60, y=20, labels=None, fs=13):
    body, x = '', 10
    for i, (t, c) in enumerate(items):
        body += box(x, y, bw, bh, t, c, fs)
        if i < len(items) - 1:
            body += arrow(x + bw, y + bh / 2, x + bw + gap, y + bh / 2, (labels or [''] * 9)[i], dy=-8)
        x += bw + gap
    return body, x - gap + 10, y + bh + 20


def seq(actors, msgs, w=760, step=38, bw=120):
    n = len(actors)
    gap = w / n
    xs = [gap * (i + .5) for i in range(n)]
    top, bh = 8, 40
    h = top + bh + 12 + len(msgs) * step + 10
    b = ''
    for i, a in enumerate(actors):
        b += (f'<line x1="{xs[i]}" y1="{top + bh}" x2="{xs[i]}" y2="{h - 6}" stroke="#9aa3c7" '
              f'stroke-dasharray="4" opacity=".5"/>')
        b += box(xs[i] - bw / 2, top, bw, bh, a, CYCLE[i % 6], 12)
    for k, (i, j, t) in enumerate(msgs):
        y = top + bh + 12 + (k + 1) * step - 12
        off = 4 if xs[j] > xs[i] else -4
        b += arrow(xs[i] + off, y, xs[j] - off, y, t, dy=-6)
    return b, w, h


F = {}  # file -> list of (anchor substring, figure html)


def add(file, anchor, html):
    F.setdefault(file, []).append((anchor, html))


# ---------- 01 Linux ----------
b = (box(20, 15, 80, 50, '-\nfile type', 'slate') + box(130, 15, 160, 50, 'rwx', 'blue', 22)
     + box(320, 15, 160, 50, 'r-x', 'violet', 22) + box(510, 15, 110, 50, '---', 'pink', 22)
     + text(60, 85, 'type') + text(210, 85, 'owner (u)') + text(400, 85, 'group (g)') + text(565, 85, 'others (o)')
     + text(210, 105, '4+2+1 = 7', 13) + text(400, 105, '4+0+1 = 5', 13) + text(565, 105, '0', 13)
     + text(320, 135, 'chmod 750 file   gives   -rwxr-x---', 14, cls='tx', extra='font-weight="700"'))
add('01-linux.html', 'Files, permissions, search',
    fig(640, 150, b, 'Read: r=4, write: w=2, execute: x=1. Add the digits for each class.', 'Permission bits', 'perm'))
b, w, h = flow([('UEFI / BIOS\nPOST', 'slate'), ('Bootloader\nGRUB', 'violet'), ('Kernel +\ninitramfs', 'blue'),
                ('systemd\n(PID 1)', 'pink'), ('Target\nmulti-user', 'amber'), ('Login and\nservices', 'green')])
add('01-linux.html', 'Processes and systemd', fig(w, h, b, 'Boot sequence. Failures at each stage have different tools: firmware setup, GRUB menu, dmesg, journalctl -b.', 'Linux boot sequence', 'boot'))

# ---------- 02 Git ----------
b, w, h = flow([('Branch\nfeature/x', 'amber'), ('Commit\nand push', 'pink'), ('Pull\nrequest', 'violet'),
                ('Review +\nCI checks', 'blue'), ('Merge\nto main', 'teal'), ('Deploy\n(CD)', 'green')])
add('02-git.html', 'Branching strategies', fig(w, h, b, 'GitHub Flow: short-lived branches, every change reviewed and tested before it reaches main.', 'GitHub Flow', 'ghflow'))

# ---------- 03 Docker ----------
b = (box(20, 12, 380, 38, 'Container writable layer (copy-on-write, deleted with container)', 'pink', 12)
     + box(20, 56, 380, 38, 'COPY app.py   (layer 4, read-only)', 'blue', 12)
     + box(20, 100, 380, 38, 'RUN pip install   (layer 3, cached if unchanged)', 'violet', 12)
     + box(20, 144, 380, 38, 'RUN useradd   (layer 2)', 'slate', 12)
     + box(20, 188, 380, 38, 'FROM python:3.12-slim   (base layers, shared)', 'teal', 12)
     + text(420, 80, 'Image = stack of read-only layers', 13, 'start', 'tx')
     + text(420, 102, 'Change layer 3 and layers 3 and above rebuild;', 12, 'start')
     + text(420, 120, 'layers below come from the build cache.', 12, 'start')
     + text(420, 150, 'Ten containers from one image share', 12, 'start')
     + text(420, 168, 'the same read-only layers on disk.', 12, 'start'))
add('03-docker.html', 'Build an image', fig(640, 235, b, 'Order Dockerfile instructions from least to most frequently changed to maximise cache hits.', 'Image layers', 'layers'))
b = (group(10, 8, 660, 250, 'Docker host', 'blue')
     + box(40, 60, 120, 50, 'web\n172.17.0.2', 'pink') + box(40, 150, 120, 50, 'db\n172.17.0.3', 'pink')
     + box(230, 100, 150, 60, 'docker0 bridge\n172.17.0.1', 'violet')
     + box(430, 100, 120, 60, 'iptables NAT\n8080 to 80', 'amber')
     + box(585, 100, 75, 60, 'eth0\nhost IP', 'teal')
     + arrow(160, 85, 230, 120, 'veth') + arrow(160, 175, 230, 140, 'veth')
     + arrow(380, 130, 430, 130) + arrow(550, 130, 585, 130)
     + text(340, 235, 'Inbound: client to host:8080 is rewritten to container:80. Outbound: masquerade to host IP.', 12))
add('03-docker.html', 'Volumes and networks', fig(680, 265, b, 'Default bridge network. Containers on a user-defined network also get DNS names (used in the lab below).', 'Docker bridge networking', 'dnet'))

# ---------- 04 Kubernetes ----------
b, w, h = seq(['kubectl', 'API server', 'etcd', 'Scheduler', 'Kubelet'],
              [(0, 1, '1 apply Deployment'), (1, 2, '2 persist desired state'),
               (3, 1, '3 watch: unscheduled Pod'), (3, 1, '4 bind Pod to node'),
               (4, 1, '5 watch: Pods for my node'), (4, 1, '6 start containers, report Running')])
add('04-kubernetes.html', 'Rolling update and rollback', fig(w, h, b, 'Every component talks only to the API server. Controllers (omitted) create the ReplicaSet and Pods between steps 2 and 3.', 'Sequence of kubectl apply', 'applyseq'))
b = (box(20, 90, 110, 50, 'Client Pod', 'slate') + box(190, 10, 170, 50, 'CoreDNS\nweb.lab to 10.96.0.10', 'amber', 12)
     + box(190, 95, 170, 70, 'Service ClusterIP\n10.96.0.10:80\n(kube-proxy rules)', 'violet', 12)
     + box(470, 15, 150, 44, 'Pod 10.244.1.5', 'green') + box(470, 88, 150, 44, 'Pod 10.244.2.7', 'green')
     + box(470, 161, 150, 44, 'Pod 10.244.1.9', 'green')
     + arrow(130, 105, 190, 40, '1 resolve') + arrow(130, 125, 190, 130, '2 connect')
     + arrow(360, 115, 470, 37) + arrow(360, 130, 470, 110) + arrow(360, 145, 470, 183)
     + text(545, 225, 'Only Ready Pods are listed in the EndpointSlice', 12))
add('04-kubernetes.html', 'Services and traffic', fig(700, 235, b, 'A Service is a stable virtual IP. kube-proxy programs iptables or IPVS rules that pick a ready Pod.', 'Service routing', 'svcroute'))
b = (box(10, 80, 130, 60, 'Pod\nvolumeMounts', 'green') + box(190, 80, 130, 60, 'PVC\nrequest 1Gi', 'blue')
     + box(370, 80, 130, 60, 'PV\nbound volume', 'violet') + box(550, 80, 140, 60, 'Disk\nEBS / local path', 'amber')
     + box(300, 5, 170, 44, 'StorageClass\nprovisioner', 'pink', 12)
     + arrow(140, 110, 190, 110) + arrow(320, 110, 370, 110, 'binds') + arrow(500, 110, 550, 110)
     + arrow(420, 49, 430, 80, 'creates', dash=True, dy=-2))
add('04-kubernetes.html', 'Storage</h2>', fig(700, 160, b, 'With a default StorageClass, a PVC triggers dynamic provisioning of a PV. Deleting the Pod keeps the data.', 'PVC and PV', 'pvc'))
b, w, h = flow([('Subject\nServiceAccount\nreader', 'slate'), ('RoleBinding\nreader-bind', 'amber'),
                ('Role\nget, list, watch\non pods', 'violet'), ('Resources\npods in\nnamespace lab', 'green')], bw=150, gap=40, bh=70)
add('04-kubernetes.html', 'Security: RBAC', fig(w, h, b, 'RBAC is additive: access exists only if a binding connects the subject to a role that allows the verb.', 'RBAC chain', 'rbac'))
b = (box(40, 20, 170, 56, 'metrics-server\nCPU usage', 'teal') + box(470, 20, 170, 56, 'HPA\ntarget 60% CPU', 'amber')
     + box(470, 150, 170, 56, 'Deployment\nreplicas: N', 'violet') + box(40, 150, 170, 56, 'Pods\nrunning', 'green')
     + arrow(125, 150, 125, 76, 'usage', dy=-4) + arrow(210, 48, 470, 48, 'average CPU')
     + arrow(555, 76, 555, 150, 'scale', dy=-4) + arrow(470, 178, 210, 178, 'create or delete')
     + text(340, 115, 'desired = ceil( current x usage / target )', 13, cls='tx'))
add('04-kubernetes.html', 'Autoscaling and resource', fig(680, 225, b, 'The HPA control loop runs about every 15 seconds. Pods must declare CPU requests for utilisation to be computed.', 'HPA loop', 'hpa'))

# ---------- 05 Helm ----------
tree = ['myapp/', '|-- Chart.yaml          name, version, dependencies', '|-- values.yaml         defaults you override',
        '|-- charts/             dependency charts', '`-- templates/', '    |-- _helpers.tpl    named snippets',
        '    |-- deployment.yaml', '    |-- service.yaml', '    `-- NOTES.txt       message after install']
b = '<rect x="10" y="8" width="620" height="206" rx="12" fill="#0a0d1a" stroke="#2a3050"/>' + ''.join(
    f'<text x="28" y="{34 + i * 21}" font-size="13" font-family="ui-monospace,Menlo,monospace" fill="{"#2dd4bf" if i in (0, 4) else "#d7e0ff"}" xml:space="preserve">{esc(l)}</text>'
    for i, l in enumerate(tree))
add('05-helm.html', 'Write your own chart', fig(640, 225, b, 'Everything under templates/ is rendered with values.yaml (plus --set overrides) into plain Kubernetes YAML.', 'Helm chart layout', 'tree'))
b = (box(20, 30, 190, 80, 'revision 1\ninstall\nsuperseded', 'slate') + box(255, 30, 190, 80, 'revision 2\nupgrade replicas=3\nsuperseded', 'slate')
     + box(490, 30, 190, 80, 'revision 3\nrollback to 1\ndeployed', 'green')
     + arrow(210, 70, 255, 70, 'upgrade', dy=-8) + arrow(445, 70, 490, 70, 'rollback 1', dy=-8)
     + text(350, 140, 'Rollback never rewrites history: it creates a new revision with the old content.', 12))
add('05-helm.html', 'Upgrade, history, rollback', fig(700, 155, b, 'Check with helm history. Release records live in Secrets in the release namespace.', 'Helm revisions', 'rev'))

# ---------- 06 Istio ----------
b = (box(10, 100, 90, 50, 'Client', 'slate') + box(130, 90, 100, 70, 'Ingress\nGateway\n(Envoy)', 'pink', 12)
     + box(270, 90, 130, 70, 'VirtualService\nmatch and\nweights', 'violet', 12) + box(440, 90, 130, 70, 'DestinationRule\nsubsets, mTLS,\ncircuit breaker', 'amber', 11)
     + box(630, 40, 80, 44, 'reviews\nv1', 'green', 12) + box(630, 166, 80, 44, 'reviews\nv3', 'teal', 12)
     + arrow(100, 125, 130, 125) + arrow(230, 125, 270, 125) + arrow(400, 125, 440, 125)
     + arrow(570, 110, 630, 62, '90%', dy=-4) + arrow(570, 140, 630, 188, '10%', dy=10))
add('06-istio.html', 'Traffic management', fig(720, 250, b, 'The VirtualService decides where traffic goes; the DestinationRule defines what each destination subset means.', 'Istio request path', 'ireq'))
b, w, h = seq(['istiod', 'App A', 'Envoy A', 'Envoy B', 'App B'],
              [(0, 2, '1 issue cert (SPIFFE ID)'), (0, 3, '1 issue cert (SPIFFE ID)'), (1, 2, '2 plain HTTP call'),
               (2, 3, '3 mTLS: verify both certs'), (3, 4, '4 plain HTTP to app')])
add('06-istio.html', 'Security</h2>', fig(w, h, b, 'Applications stay unaware of TLS. The sidecars authenticate each other and encrypt the hop.', 'Istio mTLS flow', 'mtls'))

# ---------- 07 Ansible ----------
curve = ('<path d="M265 78 Q 410 36 585 78" fill="none" stroke="#9aa3c7" stroke-width="2" stroke-dasharray="5" marker-end="url(#ar)"/>')
b = (group(10, 8, 680, 215, 'Playbook: site.yml', 'red') + group(30, 36, 640, 175, 'Play: hosts web, vars', 'violet')
     + box(50, 85, 130, 60, 'Task 1\napt install nginx', 'blue', 12) + box(200, 85, 130, 60, 'Task 2\ntemplate config', 'blue', 12)
     + box(350, 85, 130, 60, 'Task 3\nservice started', 'blue', 12) + box(520, 85, 130, 60, 'Handler\nreload nginx', 'amber', 12)
     + arrow(180, 115, 200, 115) + arrow(330, 115, 350, 115) + curve + text(430, 52, 'notify, runs once, only if changed', 11)
     + text(115, 170, 'module: apt', 11) + text(265, 170, 'module: template', 11) + text(415, 170, 'module: service', 11)
     + text(585, 170, 'module: service', 11) + text(350, 198, 'Each module checks current state first, so a second run reports changed=0.', 12))
add('07-ansible.html', 'First playbook', fig(700, 232, b, 'Playbook, play, task, module, handler: the five terms to know.', 'Ansible structure', 'ans'))

# ---------- 08 Jenkins ----------
b, w, h = seq(['Developer', 'Git', 'Jenkins\ncontroller', 'Kubernetes\nAPI', 'Agent Pod'],
              [(0, 1, '1 git push'), (1, 2, '2 webhook'), (2, 3, '3 create agent Pod'), (4, 2, '4 agent connects back'),
               (2, 4, '5 run stages'), (2, 3, '6 delete Pod when done')])
add('08-jenkins.html', 'Dynamic Kubernetes agents', fig(w, h, b, 'Each build gets a clean Pod, so there is no agent drift and no idle capacity.', 'Jenkins dynamic agents', 'jagent'))

# ---------- 09 Terraform ----------
nodes = [(10, 75, 'aws_vpc.main', 'blue'), (200, 25, 'internet_gateway', 'violet'), (200, 75, 'subnet.public', 'violet'),
         (200, 125, 'security_group', 'violet'), (200, 175, 'data.aws_ami', 'teal'), (200, 225, 's3_bucket', 'pink'),
         (10, 225, 'random_id', 'slate'), (390, 25, 'route_table', 'amber'), (570, 60, 'rt_association', 'green'),
         (570, 150, 'aws_instance', 'green')]
b = ''.join(box(x, y, 140, 36, t, c, 12) for x, y, t, c in nodes)
for e in [(150, 93, 200, 43), (150, 93, 200, 93), (150, 93, 200, 143), (340, 43, 390, 43), (530, 43, 570, 78),
          (340, 93, 570, 78), (340, 93, 570, 168), (340, 143, 570, 168), (340, 193, 570, 168), (150, 243, 200, 243)]:
    b += arrow(*e)
b += text(80, 14, 'first') + text(270, 14, 'next') + text(460, 14, 'then') + text(640, 14, 'last')
add('09-terraform.html', 'AWS project', fig(720, 270, b, 'Terraform builds this graph from references between resources and creates independent branches in parallel.', 'Terraform dependency graph', 'tfgraph'))

# ---------- 10 AWS ----------
dia = lambda cx, cy, rx, ry: f'<polygon points="{cx},{cy - ry} {cx + rx},{cy} {cx},{cy + ry} {cx - rx},{cy}" fill="#6c8cff"/>'
b = (box(10, 100, 100, 50, 'API request', 'slate') + dia(200, 125, 70, 50)
     + '<text x="200" y="121" font-size="12" fill="#fff" text-anchor="middle">Explicit</text><text x="200" y="136" font-size="12" fill="#fff" text-anchor="middle">Deny?</text>'
     + dia(430, 125, 100, 55)
     + '<text x="430" y="115" font-size="12" fill="#fff" text-anchor="middle">Allowed by identity</text><text x="430" y="130" font-size="12" fill="#fff" text-anchor="middle">or resource policy,</text><text x="430" y="145" font-size="12" fill="#fff" text-anchor="middle">SCP, boundary?</text>'
     + arrow(110, 125, 130, 125) + arrow(270, 125, 330, 125, 'no') + arrow(530, 125, 585, 125, 'yes')
     + arrow(200, 175, 200, 205, 'yes', dy=-2) + arrow(430, 180, 430, 205, 'no', dy=-2)
     + box(580, 100, 110, 50, 'ALLOW', 'green') + box(160, 205, 80, 34, 'DENY', 'red') + box(380, 205, 100, 34, 'DENY (implicit)', 'red', 12))
add('10-aws.html', 'IAM: identities', fig(700, 250, b, 'An explicit Deny always wins. With no matching Allow the default is deny.', 'IAM policy evaluation', 'iam'))
b, w, h = seq(['Pod\n(SA token)', 'kube-apiserver\n(OIDC issuer)', 'AWS STS', 'Amazon S3'],
              [(0, 2, '1 AssumeRoleWithWebIdentity'), (2, 1, '2 fetch OIDC keys, verify token'),
               (2, 0, '3 temporary credentials'), (0, 3, '4 call S3 with credentials')], w=720)
add('10-aws.html', 'Containers: ECR and EKS', fig(w, h, b, 'IRSA: pods get short-lived credentials for one role. No access keys are stored in the cluster.', 'IRSA credential flow', 'irsa'))

# ---------- 12 Capstone ----------
b, w, h = seq(['Developer', 'Git', 'Jenkins', 'ECR', 'EKS\nHelm + Istio', 'Prometheus'],
              [(0, 1, '1 push'), (1, 2, '2 webhook'), (2, 3, '3 push image:TAG'), (2, 4, '4 helm upgrade, canary 10%'),
               (4, 5, '5 Envoy metrics'), (2, 5, '6 query canary 5xx rate'), (2, 4, '7 promote to 100% or rollback')], bw=108)
add('12-capstone-platform.html', 'Step 5: The Jenkinsfile', fig(w, h, b, 'The pipeline decides from measured error rates, not from hope. Step 7 is gated by the 5xx check and a human approval.', 'Canary pipeline sequence', 'canseq'))


def main():
    total = 0
    for f, items in F.items():
        p = SRC / f
        lines = p.read_text().split('\n')
        for anchor, html in items:
            marker = html.split('-->')[0]
            if marker in '\n'.join(lines):
                continue
            idx = next((i for i, l in enumerate(lines) if l.lstrip().startswith('<h') and anchor in l), None)
            if idx is None:
                raise SystemExit(f'anchor not found: {f}: {anchor}')
            lines.insert(idx + 1, html)
            total += 1
        p.write_text('\n'.join(lines))
    print('inserted', total, 'figures')


if __name__ == '__main__':
    main()
