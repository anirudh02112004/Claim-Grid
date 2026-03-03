import psycopg2
from psycopg2.extras import RealDictCursor

DB_CONFIG = {
    "host": "localhost",
    "database": "insurancedb",
    "user": "postgres",
    "password": "shreyuu",
    "port": 5432
}

def get_connection():
    return psycopg2.connect(**DB_CONFIG)


def fetch_claim_features(claim_id: int):
    conn = get_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)

    query = """
    SELECT 
        c.id,
        c.claim_amount,
        h.trust_score AS hospital_trust_score,
        p.policy_start_date,
        p.id AS policy_id
    FROM claims c
    JOIN hospitals h ON c.hospital_id = h.id
    JOIN policies p ON c.policy_id = p.id
    WHERE c.id = %s;
    """

    cur.execute(query, (claim_id,))
    claim = cur.fetchone()

    if not claim:
        return None

    # Calculate derived features
    cur.execute(
        "SELECT COUNT(*) FROM claims WHERE policy_id = %s AND id < %s;",
        (claim["policy_id"], claim_id)
    )
    previous_claims = cur.fetchone()["count"]

    conn.close()

    return {
        "claim_amount": claim["claim_amount"],
        "hospital_trust_score": claim["hospital_trust_score"],
        "previous_claims_count": previous_claims,
        "policy_tenure_months": 12,  # temporary (we refine later)
        "days_since_policy_start": 100  # temporary (refine later)
    }

def update_claim_score(claim_id: int, score: float):
    conn = get_connection()
    cur = conn.cursor()

    status = "auto-approved" if score > 0.8 else "manual-review"

    cur.execute("""
        UPDATE claims
        SET ml_score = %s,
            status = %s
        WHERE id = %s;
    """, (score, status, claim_id))

    conn.commit()
    conn.close()